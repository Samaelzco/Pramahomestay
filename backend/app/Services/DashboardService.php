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

    public function summary(array $filters = []): array
    {
        $today = CarbonImmutable::today();
        $isCustom = isset($filters['from'], $filters['to']);
        $days = $isCustom ? null : (int) ($filters['days'] ?? 30);
        $end = $isCustom ? CarbonImmutable::parse($filters['to'])->startOfDay() : $today;
        $start = $isCustom ? CarbonImmutable::parse($filters['from'])->startOfDay() : $end->subDays($days - 1);
        $rangeDays = $start->diffInDays($end) + 1;
        $granularity = $rangeDays <= 90 ? 'day' : ($end->lte($start->addYears(2)) ? 'week' : 'month');
        $snapshot = $this->dashboard->snapshot($start, $end);
        $activeRooms = max((int) $snapshot['active_room_count'], 1);
        $todayString = $today->toDateString();
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
            ->filter(fn ($booking): bool => $booking->check_in->toDateString() === $todayString)
            ->values();
        $departures = $activeBookings
            ->whereIn('status', [BookingStatus::CheckedIn, BookingStatus::CheckedOut])
            ->filter(fn ($booking): bool => $booking->check_out->toDateString() === $todayString)
            ->values();
        $occupiedToday = $activeBookings
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::CheckedIn, BookingStatus::CheckedOut])
            ->filter(fn ($booking): bool => $booking->check_in->lte($today) && $booking->check_out->gt($today))
            ->pluck('room_id')->unique()->count();

        return [
            'period' => [
                'days' => $days,
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
                'granularity' => $granularity,
                'is_custom' => $isCustom,
            ],
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
            'series' => $this->series($start, $end, $granularity, $snapshot, $activeRooms),
            'booking_statuses' => $this->statusRows(BookingStatus::cases(), $snapshot['booking_statuses']),
            'payment_statuses' => $this->statusRows(PaymentStatus::cases(), $snapshot['payment_statuses']),
            'operations' => [
                'date' => $todayString,
                'arrivals' => $this->bookingRows($arrivals),
                'departures' => $this->bookingRows($departures),
            ],
            'recent_bookings' => $this->bookingRows($snapshot['recent_bookings']),
            'payment_followups' => $this->followups($activeBookings),
        ];
    }

    private function series(CarbonImmutable $start, CarbonImmutable $end, string $granularity, array $snapshot, int $activeRooms): array
    {
        return collect($this->buckets($start, $end, $granularity))->map(function (array $bucket) use ($snapshot, $activeRooms): array {
            [$bucketStart, $bucketEnd] = $bucket;
            $capacityDays = $activeRooms * ($bucketStart->diffInDays($bucketEnd) + 1);

            return [
                'date' => $bucketStart->toDateString(),
                'end_date' => $bucketEnd->toDateString(),
                'bookings' => $snapshot['period_bookings']->filter(
                    fn ($booking): bool => $booking->created_at->betweenIncluded($bucketStart->startOfDay(), $bucketEnd->endOfDay())
                )->count(),
                'revenue' => $this->money($snapshot['period_payments']->filter(
                    fn ($payment): bool => $payment->paid_at?->betweenIncluded($bucketStart->startOfDay(), $bucketEnd->endOfDay()) ?? false
                )->sum('amount_paid')),
                'occupancy_rate' => round(($this->occupiedRoomDays($snapshot['period_stays'], $bucketStart, $bucketEnd) / $capacityDays) * 100, 1),
            ];
        })->all();
    }

    private function buckets(CarbonImmutable $start, CarbonImmutable $end, string $granularity): array
    {
        $buckets = [];
        for ($cursor = $start; $cursor->lte($end); $cursor = $bucketEnd->addDay()) {
            $bucketEnd = match ($granularity) {
                'day' => $cursor,
                'week' => $cursor->addDays(6)->min($end),
                default => $cursor->endOfMonth()->startOfDay()->min($end),
            };
            $buckets[] = [$cursor, $bucketEnd];
        }

        return $buckets;
    }

    private function occupiedRoomDays(Collection $stays, CarbonImmutable $start, CarbonImmutable $end): int
    {
        $exclusiveEnd = $end->addDay();

        return $stays->groupBy('room_id')->sum(function (Collection $roomStays) use ($start, $exclusiveEnd): int {
            $intervals = $roomStays->map(function ($stay) use ($start, $exclusiveEnd): array {
                $from = CarbonImmutable::instance($stay->check_in)->max($start);
                $to = CarbonImmutable::instance($stay->check_out)->min($exclusiveEnd);

                return [$from, $to];
            })->filter(fn (array $interval): bool => $interval[0]->lt($interval[1]))->sortBy(fn (array $interval): int => $interval[0]->getTimestamp())->values();

            $days = 0;
            $currentStart = null;
            $currentEnd = null;
            foreach ($intervals as [$from, $to]) {
                if ($currentStart === null) {
                    [$currentStart, $currentEnd] = [$from, $to];
                } elseif ($from->lte($currentEnd)) {
                    $currentEnd = $to->max($currentEnd);
                } else {
                    $days += $currentStart->diffInDays($currentEnd);
                    [$currentStart, $currentEnd] = [$from, $to];
                }
            }

            return $currentStart === null ? 0 : $days + $currentStart->diffInDays($currentEnd);
        });
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
