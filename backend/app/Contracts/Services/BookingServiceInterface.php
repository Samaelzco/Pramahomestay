<?php

namespace App\Contracts\Services;

use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BookingServiceInterface
{
    /** @return LengthAwarePaginator<int, Booking> */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $attributes, ?int $createdBy = null): Booking;

    public function update(Booking $booking, array $attributes): Booking;

    public function cancel(Booking $booking, ?string $reason = null): Booking;

    public function delete(Booking $booking): void;
}
