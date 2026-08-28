<?php

namespace App\Contracts\Repositories;

use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BookingRepositoryInterface
{
    /** @return LengthAwarePaginator<int, Booking> */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $attributes): Booking;

    public function update(Booking $booking, array $attributes): Booking;

    public function delete(Booking $booking): void;

    public function findForUpdate(int $id): Booking;

    public function findByPublicTokenHash(string $tokenHash): Booking;

    public function hasDateConflict(int $roomId, string $checkIn, string $checkOut, ?int $ignoreId = null): bool;

    public function codeExists(string $code): bool;
}
