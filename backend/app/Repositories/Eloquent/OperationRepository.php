<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\OperationRepositoryInterface;
use App\Enums\BookingStatus;
use App\Enums\RoomStatus;
use App\Models\Booking;
use App\Models\Room;
use Carbon\CarbonImmutable;

class OperationRepository implements OperationRepositoryInterface
{
    public function snapshot(CarbonImmutable $date): array
    {
        $with = ['room', 'payment'];

        return [
            'arrivals' => Booking::query()->with($with)
                ->where(function ($query) use ($date): void {
                    $query->where(function ($query) use ($date): void {
                        $query->where('status', BookingStatus::Confirmed->value)->whereDate('check_in', '<=', $date);
                    })->orWhere(function ($query) use ($date): void {
                        $query->where('status', BookingStatus::CheckedIn->value)
                            ->where(function ($query) use ($date): void {
                                $query->whereDate('checked_in_at', $date)
                                    ->orWhere(function ($query) use ($date): void {
                                        $query->whereNull('checked_in_at')->whereDate('check_in', $date);
                                    });
                            });
                    });
                })->orderBy('check_in')->orderBy('room_id')->get(),
            'departures' => Booking::query()->with($with)
                ->where(function ($query) use ($date): void {
                    $query->where(function ($query) use ($date): void {
                        $query->where('status', BookingStatus::CheckedIn->value)->whereDate('check_out', '<=', $date);
                    })->orWhere(function ($query) use ($date): void {
                        $query->where('status', BookingStatus::CheckedOut->value)
                            ->where(function ($query) use ($date): void {
                                $query->whereDate('checked_out_at', $date)
                                    ->orWhere(function ($query) use ($date): void {
                                        $query->whereNull('checked_out_at')->whereDate('check_out', $date);
                                    });
                            });
                    });
                })->orderBy('check_out')->orderBy('room_id')->get(),
            'occupied_count' => Booking::query()->where('status', BookingStatus::CheckedIn->value)->distinct('room_id')->count('room_id'),
            'cleaning_rooms' => Room::query()->where('is_active', true)->where('status', RoomStatus::Cleaning->value)->orderBy('name')->get(),
        ];
    }

    public function hasCheckedInBooking(int $roomId, ?int $ignoreBookingId = null): bool
    {
        return Booking::query()->where('room_id', $roomId)
            ->where('status', BookingStatus::CheckedIn->value)
            ->when($ignoreBookingId, fn ($query, int $id) => $query->whereKeyNot($id))
            ->exists();
    }
}
