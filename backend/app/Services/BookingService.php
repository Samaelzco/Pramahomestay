<?php

namespace App\Services;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Services\BookingServiceInterface;
use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Guest;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingService implements BookingServiceInterface
{
    public function __construct(
        private readonly BookingRepositoryInterface $bookings,
        private readonly RoomRepositoryInterface $rooms,
        private readonly GuestRepositoryInterface $guests,
        private readonly PaymentRepositoryInterface $payments,
        private readonly HomestaySettingRepositoryInterface $settings,
    ) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->bookings->paginate($filters, $perPage);
    }

    public function create(array $attributes, ?int $createdBy = null): Booking
    {
        return DB::transaction(function () use ($attributes, $createdBy): Booking {
            $room = $this->rooms->findForUpdate((int) $attributes['room_id']);
            $guest = $this->guests->findForUpdate((int) $attributes['guest_id']);

            if (! $room->is_active) {
                throw ValidationException::withMessages(['room_id' => 'Kamar yang dipilih sedang tidak aktif.']);
            }

            if (! $guest->is_active) {
                throw ValidationException::withMessages(['guest_id' => 'Profil tamu yang dipilih sedang tidak aktif.']);
            }

            $attributes = $this->prepareAttributes($attributes, $room->id, $room->capacity, (string) $room->price_per_night);
            $attributes = $this->applyGuestSnapshot($attributes, $guest);
            $attributes['booking_code'] = $this->uniqueCode();
            $attributes['created_by'] = $createdBy;

            return $this->bookings->create($attributes);
        });
    }

    public function createPublic(array $attributes): Booking
    {
        return DB::transaction(function () use ($attributes): Booking {
            $publicToken = Str::random(64);
            $email = mb_strtolower(trim((string) $attributes['email']));
            $guest = $this->guests->findByEmailForUpdate($email);
            $guestAttributes = [
                'full_name' => trim((string) $attributes['full_name']),
                'email' => $email,
                'phone' => trim((string) $attributes['phone']),
            ];

            if ($guest === null) {
                $guest = $this->guests->create([...$guestAttributes, 'created_by' => null]);
            } else {
                if (! $guest->is_active) {
                    throw ValidationException::withMessages(['email' => 'Profil tamu ini sedang tidak aktif. Hubungi pengelola untuk bantuan.']);
                }
                $guest = $this->guests->update($guest, $guestAttributes);
            }

            $booking = $this->create([
                'public_access_token_hash' => hash('sha256', $publicToken),
                'room_id' => (int) $attributes['room_id'],
                'guest_id' => $guest->id,
                'check_in' => $attributes['check_in'],
                'check_out' => $attributes['check_out'],
                'guest_count' => (int) $attributes['guest_count'],
                'status' => BookingStatus::Pending->value,
                'payment_due_at' => now()->addHours(24),
                'special_requests' => $attributes['special_requests'] ?? null,
                'internal_notes' => null,
            ]);

            return $booking->setAttribute('public_access_token', $publicToken);
        });
    }

    public function findPublicByToken(string $token): Booking
    {
        abort_unless(preg_match('/^[A-Za-z0-9]{64}$/', $token) === 1, 404);

        return $this->bookings->findByPublicTokenHash(hash('sha256', $token));
    }

    public function recoverPublicAccess(string $bookingCode, string $contact): string
    {
        $booking = $this->bookings->findByCode(Str::upper(trim($bookingCode)));
        $normalizedContact = mb_strtolower(trim($contact));
        $matches = false;

        if ($booking !== null) {
            $matches = str_contains($normalizedContact, '@')
                ? hash_equals(mb_strtolower(trim($booking->guest_email)), $normalizedContact)
                : hash_equals(
                    preg_replace('/\D+/', '', $booking->guest_phone) ?? '',
                    preg_replace('/\D+/', '', $normalizedContact) ?? '',
                );
        }

        if (! $matches) {
            throw ValidationException::withMessages([
                'contact' => 'Kode booking atau data kontak tidak cocok.',
            ]);
        }

        $publicToken = Str::random(64);
        $this->bookings->rotatePublicToken($booking, hash('sha256', $publicToken));

        return $publicToken;
    }

    public function update(Booking $booking, array $attributes): Booking
    {
        return DB::transaction(function () use ($booking, $attributes): Booking {
            $booking = $this->bookings->findForUpdate($booking->id);
            $requestedStatus = BookingStatus::from($attributes['status']);
            if ($booking->status === BookingStatus::Cancelled && $requestedStatus !== BookingStatus::Cancelled) {
                throw ValidationException::withMessages(['status' => 'Booking yang dibatalkan tidak dapat diaktifkan kembali.']);
            }
            if ($requestedStatus === BookingStatus::Cancelled && $booking->status !== BookingStatus::Cancelled) {
                $this->assertCanCancel($booking);
            }

            $room = $this->rooms->findForUpdate((int) $attributes['room_id']);
            $guestChanged = (int) $attributes['guest_id'] !== (int) $booking->guest_id;
            $guest = $guestChanged
                ? $this->guests->findForUpdate((int) $attributes['guest_id'])
                : null;

            if ($room->id !== $booking->room_id && ! $room->is_active) {
                throw ValidationException::withMessages(['room_id' => 'Kamar yang dipilih sedang tidak aktif.']);
            }

            if ($guest !== null && ! $guest->is_active) {
                throw ValidationException::withMessages(['guest_id' => 'Profil tamu yang dipilih sedang tidak aktif.']);
            }

            $price = $room->id === $booking->room_id
                ? (string) $booking->price_per_night
                : (string) $room->price_per_night;
            $attributes = $this->prepareAttributes($attributes, $room->id, $room->capacity, $price, $booking->id);
            if ($guest !== null) {
                $attributes = $this->applyGuestSnapshot($attributes, $guest);
            }

            return $this->bookings->update($booking, $attributes);
        });
    }

    public function cancel(Booking $booking, ?string $reason = null): Booking
    {
        return DB::transaction(function () use ($booking, $reason): Booking {
            $locked = $this->bookings->findForUpdate($booking->id);

            if ($locked->status === BookingStatus::Cancelled) {
                return $locked->load(['room', 'guest']);
            }

            $this->assertCanCancel($locked);

            $attributes = ['status' => BookingStatus::Cancelled->value];
            if ($reason !== null && trim($reason) !== '') {
                $entry = 'Alasan pembatalan: '.trim($reason);
                $attributes['internal_notes'] = trim(implode("\n\n", array_filter([$locked->internal_notes, $entry])));
            }

            return $this->bookings->update($locked, $attributes);
        });
    }

    public function delete(Booking $booking): void
    {
        DB::transaction(function () use ($booking): void {
            $locked = $this->bookings->findForUpdate($booking->id);
            if (! in_array($locked->status, [BookingStatus::Pending, BookingStatus::Cancelled], true)) {
                throw ValidationException::withMessages(['delete' => 'Hanya booking menunggu atau dibatalkan yang dapat dihapus.']);
            }
            if ($this->payments->hasAnyPaymentForBooking($locked->id)) {
                throw ValidationException::withMessages(['delete' => 'Booking tidak dapat dihapus karena sudah memiliki data pembayaran.']);
            }

            $this->bookings->delete($locked);
        });
    }

    private function assertCanCancel(Booking $booking): void
    {
        if (! in_array($booking->status, [BookingStatus::Pending, BookingStatus::Confirmed], true)) {
            throw ValidationException::withMessages(['status' => 'Booking yang sudah check-in atau selesai tidak dapat dibatalkan.']);
        }

        if ($this->payments->hasCreditedPaymentForBooking($booking->id)) {
            throw ValidationException::withMessages(['status' => 'Kembalikan pembayaran terlebih dahulu sebelum membatalkan booking.']);
        }
    }

    private function prepareAttributes(array $attributes, int $roomId, int $capacity, string $price, ?int $ignoreId = null): array
    {
        if ((int) $attributes['guest_count'] > $capacity) {
            throw ValidationException::withMessages([
                'guest_count' => "Kapasitas kamar maksimal {$capacity} tamu.",
            ]);
        }

        if ($attributes['status'] !== BookingStatus::Cancelled->value
            && $this->bookings->hasDateConflict($roomId, $attributes['check_in'], $attributes['check_out'], $ignoreId)) {
            throw ValidationException::withMessages([
                'check_in' => 'Kamar sudah memiliki booking pada rentang tanggal tersebut.',
            ]);
        }

        $nights = CarbonImmutable::parse($attributes['check_in'])->diffInDays(CarbonImmutable::parse($attributes['check_out']));
        $attributes['price_per_night'] = $price;
        $attributes['total_nights'] = $nights;
        $attributes['total_amount'] = bcmul($price, (string) $nights, 2);

        return $attributes;
    }

    private function uniqueCode(): string
    {
        $prefix = $this->settings->current()->booking_code_prefix;
        do {
            $code = $prefix.'-'.now()->format('ym').'-'.Str::upper(Str::random(6));
        } while ($this->bookings->codeExists($code));

        return $code;
    }

    private function applyGuestSnapshot(array $attributes, Guest $guest): array
    {
        $attributes['guest_id'] = $guest->id;
        $attributes['guest_name'] = $guest->full_name;
        $attributes['guest_email'] = $guest->email;
        $attributes['guest_phone'] = $guest->phone;

        return $attributes;
    }
}
