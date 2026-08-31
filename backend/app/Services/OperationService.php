<?php

namespace App\Services;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Repositories\OperationRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Services\OperationServiceInterface;
use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\RoomStatus;
use App\Models\Booking;
use App\Models\Room;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OperationService implements OperationServiceInterface
{
    public function __construct(
        private readonly OperationRepositoryInterface $operations,
        private readonly BookingRepositoryInterface $bookings,
        private readonly RoomRepositoryInterface $rooms,
        private readonly PaymentRepositoryInterface $payments,
        private readonly HomestaySettingRepositoryInterface $settings,
    ) {}

    public function daily(array $filters = []): array
    {
        $timezone = $this->settings->current()->timezone;
        $today = CarbonImmutable::today($timezone);
        $date = CarbonImmutable::parse($filters['date'] ?? $today->toDateString(), $timezone)->startOfDay();
        $snapshot = $this->operations->snapshot($date);

        return [
            'date' => $date->toDateString(),
            'today' => $today->toDateString(),
            'summary' => [
                'arrivals_due' => $snapshot['arrivals']->where('status', BookingStatus::Confirmed)->count(),
                'departures_due' => $snapshot['departures']->where('status', BookingStatus::CheckedIn)->count(),
                'occupied_rooms' => (int) $snapshot['occupied_count'],
                'cleaning_rooms' => $snapshot['cleaning_rooms']->count(),
            ],
            'arrivals' => $snapshot['arrivals']->map(fn (Booking $booking): array => $this->bookingRow($booking, $today, 'arrival'))->values()->all(),
            'departures' => $snapshot['departures']->map(fn (Booking $booking): array => $this->bookingRow($booking, $today, 'departure'))->values()->all(),
            'housekeeping' => $snapshot['cleaning_rooms']->map(fn (Room $room): array => [
                'id' => $room->id,
                'name' => $room->name,
                'status' => $room->status->value,
                'status_label' => $room->status->label(),
                'updated_at' => $room->updated_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }

    public function checkIn(Booking $booking, ?int $userId = null, ?string $note = null): Booking
    {
        return DB::transaction(function () use ($booking, $userId, $note): Booking {
            $booking = $this->bookings->findForUpdate($booking->id);
            if ($booking->status !== BookingStatus::Confirmed) {
                throw ValidationException::withMessages(['status' => 'Hanya booking terkonfirmasi yang dapat check-in.']);
            }

            $today = CarbonImmutable::today($this->settings->current()->timezone);
            if ($booking->check_in->toDateString() > $today->toDateString()) {
                throw ValidationException::withMessages(['status' => 'Tanggal check-in booking ini belum tiba.']);
            }

            $payment = $this->payments->findByBookingForUpdate($booking->id);
            if ($payment?->status !== PaymentStatus::Paid) {
                throw ValidationException::withMessages(['payment' => 'Pembayaran harus lunas dan terverifikasi sebelum check-in.']);
            }

            $room = $this->rooms->findForUpdate($booking->room_id);
            if (! $room->is_active || in_array($room->status, [RoomStatus::Maintenance, RoomStatus::Cleaning], true)) {
                throw ValidationException::withMessages(['room' => 'Kamar belum siap menerima tamu.']);
            }
            if ($this->operations->hasCheckedInBooking($room->id, $booking->id)) {
                throw ValidationException::withMessages(['room' => 'Kamar sedang ditempati oleh booking lain.']);
            }

            $attributes = [
                'status' => BookingStatus::CheckedIn->value,
                'checked_in_at' => now(),
                'checked_in_by' => $userId,
                'internal_notes' => $this->appendNote($booking->internal_notes, 'Catatan check-in', $note),
            ];
            $updated = $this->bookings->update($booking, $attributes);
            $this->rooms->update($room, ['status' => RoomStatus::Occupied->value]);

            return $updated;
        });
    }

    public function checkOut(Booking $booking, ?int $userId = null, ?string $note = null): Booking
    {
        return DB::transaction(function () use ($booking, $userId, $note): Booking {
            $booking = $this->bookings->findForUpdate($booking->id);
            if ($booking->status !== BookingStatus::CheckedIn) {
                throw ValidationException::withMessages(['status' => 'Hanya tamu yang sudah check-in yang dapat check-out.']);
            }

            $room = $this->rooms->findForUpdate($booking->room_id);
            $updated = $this->bookings->update($booking, [
                'status' => BookingStatus::CheckedOut->value,
                'checked_out_at' => now(),
                'checked_out_by' => $userId,
                'internal_notes' => $this->appendNote($booking->internal_notes, 'Catatan check-out', $note),
            ]);
            $this->rooms->update($room, ['status' => RoomStatus::Cleaning->value]);

            return $updated;
        });
    }

    public function markRoomReady(Room $room): Room
    {
        return DB::transaction(function () use ($room): Room {
            $room = $this->rooms->findForUpdate($room->id);
            if ($room->status !== RoomStatus::Cleaning) {
                throw ValidationException::withMessages(['status' => 'Hanya kamar dalam proses pembersihan yang dapat ditandai siap.']);
            }
            if ($this->operations->hasCheckedInBooking($room->id)) {
                throw ValidationException::withMessages(['status' => 'Kamar masih memiliki tamu yang sedang check-in.']);
            }

            return $this->rooms->update($room, ['status' => RoomStatus::Ready->value]);
        });
    }

    private function bookingRow(Booking $booking, CarbonImmutable $today, string $context): array
    {
        $paymentStatus = $booking->payment?->status ?? PaymentStatus::Unpaid;
        $canCheckIn = $context === 'arrival' && $booking->status === BookingStatus::Confirmed
            && $booking->check_in->toDateString() <= $today->toDateString() && $paymentStatus === PaymentStatus::Paid;
        $blockReason = null;
        if ($context === 'arrival' && $booking->status === BookingStatus::Confirmed && ! $canCheckIn) {
            $blockReason = $booking->check_in->toDateString() > $today->toDateString()
                ? 'Tanggal check-in belum tiba'
                : 'Pembayaran belum lunas dan terverifikasi';
        }

        return [
            'id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'guest_name' => $booking->guest_name,
            'guest_phone' => $booking->guest_phone,
            'room' => ['id' => $booking->room->id, 'name' => $booking->room->name],
            'check_in' => $booking->check_in->toDateString(),
            'check_out' => $booking->check_out->toDateString(),
            'guest_count' => $booking->guest_count,
            'status' => $booking->status->value,
            'status_label' => $booking->status->label(),
            'payment' => [
                'id' => $booking->payment?->id,
                'status' => $paymentStatus->value,
                'status_label' => $paymentStatus->label(),
            ],
            'checked_in_at' => $booking->checked_in_at?->toIso8601String(),
            'checked_out_at' => $booking->checked_out_at?->toIso8601String(),
            'can_check_in' => $canCheckIn,
            'can_check_out' => $context === 'departure' && $booking->status === BookingStatus::CheckedIn,
            'action_block_reason' => $blockReason,
        ];
    }

    private function appendNote(?string $current, string $label, ?string $note): ?string
    {
        $note = trim((string) $note);
        if ($note === '') {
            return $current;
        }

        return trim(implode("\n\n", array_filter([$current, "{$label}: {$note}"])));
    }
}
