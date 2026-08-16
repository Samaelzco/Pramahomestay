<?php

namespace App\Services;

use App\Contracts\Repositories\DashboardRepositoryInterface;
use App\Contracts\Services\DashboardServiceInterface;
use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class DashboardService implements DashboardServiceInterface
{
    public function __construct(private readonly DashboardRepositoryInterface $dashboard) {}

    public function summary(int $days = 30): array
    {
        $end = CarbonImmutable::today();
        $start = $end->subDays($days - 1);
        $snapshot = $this->dashboard->snapshot($start, $end);
        $activeRooms = max((int) $snapshot['active_room_count'], 1);
        $today = $end->toDateString();
        $activeBookings = $snapshot['active_bookings'];

        $outstanding = $activeBookings->sum(function ($booking): float {
            $payment = $booking->payment;
            $credited = $payment && in_array($payment->status, [PaymentStatus::Partial, PaymentStatus::Paid], true)
                ? (float) $payment->amount_paid
                : 0;

            return max((float) $booking->total_amount - $credited, 0);
        });

        $arrivals = $activeBookings
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::CheckedIn])
            ->filter(fn ($booking): bool => $booking->check_in->toDateString() === $today)
            ->values();
        $departures = $activeBookings
            ->whereIn('status', [BookingStatus::CheckedIn, BookingStatus::CheckedOut])
            ->filter(fn ($booking): bool => $booking->check_out->toDateString() === $today)
            ->values();
        $occupiedToday = $snapshot['period_stays']
            ->filter(fn ($booking): bool => $booking->check_in->lte($end) && $booking->check_out->gt($end))
            ->pluck('room_id')->unique()->count();

        return [
            'period' => ['days' => $days, 'start' => $start->toDateString(), 'end' => $end->toDateString()],
            'metrics' => [
                'bookings' => $snapshot['period_bookings']->count(),
                'revenue' => $this->money($snapshot['period_payments']->sum('amount_paid')),
                'occupancy_rate' => round(($occupiedToday / $activeRooms) * 100, 1),
                'occupied_rooms' => $occupiedToday,
                'active_rooms' => (int) $snapshot['active_room_count'],
                'outstanding' => $this->money($outstanding),
                'arrivals_today' => $arrivals->count(),
                'departures_today' => $departures->count(),
            ],
            'series' => $this->series($start, $end, $snapshot, $activeRooms),
            'booking_statuses' => $this->statusRows(BookingStatus::cases(), $snapshot['booking_statuses']),
            'payment_statuses' => $this->statusRows(PaymentStatus::cases(), $snapshot['payment_statuses']),
            'operations' => [
                'arrivals' => $this->bookingRows($arrivals),
                'departures' => $this->bookingRows($departures),
            ],
            'recent_bookings' => $this->bookingRows($snapshot['recent_bookings']),
            'payment_followups' => $this->followups($activeBookings),
        ];
    }

    private function series(CarbonImmutable $start, CarbonImmutable $end, array $snapshot, int $activeRooms): array
    {
        $rows = [];
        for ($date = $start; $date->lte($end); $date = $date->addDay()) {
            $dateString = $date->toDateString();
            $occupied = $snapshot['period_stays']
                ->filter(fn ($booking): bool => $booking->check_in->lte($date) && $booking->check_out->gt($date))
                ->pluck('room_id')->unique()->count();

            $rows[] = [
                'date' => $dateString,
                'bookings' => $snapshot['period_bookings']->filter(
                    fn ($booking): bool => $booking->created_at->toDateString() === $dateString
                )->count(),
                'revenue' => $this->money($snapshot['period_payments']->filter(
                    fn ($payment): bool => $payment->paid_at?->toDateString() === $dateString
                )->sum('amount_paid')),
                'occupancy_rate' => round(($occupied / $activeRooms) * 100, 1),
            ];
        }

        return $rows;
    }

    private function statusRows(array $cases, Collection $counts): array
    {
        return collect($cases)->map(fn ($status): array => [
            'status' => $status->value,
            'label' => $status->label(),
            'count' => (int) ($counts[$status->value] ?? 0),
        ])->all();
    }

    private function bookingRows(Collection $bookings): array
    {
        return $bookings->map(fn ($booking): array => [
            'id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'guest_name' => $booking->guest_name,
            'room_name' => $booking->room?->name,
            'check_in' => $booking->check_in->toDateString(),
            'check_out' => $booking->check_out->toDateString(),
            'status' => $booking->status->value,
            'status_label' => $booking->status->label(),
            'total_amount' => $this->money($booking->total_amount),
        ])->values()->all();
    }

    private function followups(Collection $bookings): array
    {
        return $bookings->map(function ($booking): ?array {
            $payment = $booking->payment;
            $credited = $payment && in_array($payment->status, [PaymentStatus::Partial, PaymentStatus::Paid], true)
                ? (float) $payment->amount_paid : 0;
            $remaining = max((float) $booking->total_amount - $credited, 0);
            if ($remaining <= 0) {
                return null;
            }

            return [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'guest_name' => $booking->guest_name,
                'room_name' => $booking->room?->name,
                'check_in' => $booking->check_in->toDateString(),
                'remaining_amount' => $this->money($remaining),
                'payment_status' => $payment?->status->value ?? PaymentStatus::Unpaid->value,
                'payment_status_label' => $payment?->status->label() ?? PaymentStatus::Unpaid->label(),
            ];
        })->filter()->sortBy('check_in')->take(5)->values()->all();
    }

    private function money(float|int|string $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }
}
