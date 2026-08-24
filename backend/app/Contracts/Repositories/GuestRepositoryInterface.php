<?php

namespace App\Contracts\Repositories;

use App\Models\Guest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface GuestRepositoryInterface
{
    /** @return LengthAwarePaginator<int, Guest> */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $attributes): Guest;

    public function update(Guest $guest, array $attributes): Guest;

    public function delete(Guest $guest): void;

    public function hasAnyBooking(int $guestId): bool;

    public function findForUpdate(int $id): Guest;

    public function findByEmailForUpdate(string $email): ?Guest;

    public function withDetails(Guest $guest): Guest;
}
