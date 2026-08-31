<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\DashboardRepositoryInterface;
use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Room;
use Carbon\CarbonImmutable;

class DashboardRepository implements DashboardRepositoryInterface
{
    public function snapshot(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $activeStatuses = [
            BookingStatus::Confirmed->value,
            BookingStatus::CheckedIn->value,
            BookingStatus::CheckedOut->value,
        ];

        return [
            'active_room_count' => Room::query()->where('is_active', true)->count(),
            'period_bookings' => Booking::query()
                ->whereBetween('created_at', [$start->startOfDay(), $end->endOfDay()])
                ->get(),
            'period_stays' => Booking::query()
                ->whereIn('status', $activeStatuses)
                ->whereDate('check_in', '<=', $end)
                ->whereDate('check_out', '>', $start)
                ->get(),
            'period_payments' => Payment::query()
                ->whereIn('status', [PaymentStatus::Partial->value, PaymentStatus::Paid->value])
                ->whereBetween('paid_at', [$start->startOfDay(), $end->endOfDay()])
                ->get(),
            'active_bookings' => Booking::query()
                ->with(['room', 'payment'])
                ->where('status', '!=', BookingStatus::Cancelled->value)
                ->get(),
            'recent_bookings' => Booking::query()
                ->with('room')
                ->latest()
                ->limit(5)
                ->get(),
            'booking_statuses' => Booking::query()
                ->selectRaw('status, COUNT(*) as aggregate')
                ->groupBy('status')
                ->pluck('aggregate', 'status'),
            'payment_statuses' => Payment::query()
                ->selectRaw('status, COUNT(*) as aggregate')
                ->groupBy('status')
                ->pluck('aggregate', 'status'),
        ];
    }
}
