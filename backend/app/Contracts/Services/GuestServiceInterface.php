<?php

namespace App\Contracts\Services;

use App\Models\Guest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface GuestServiceInterface
{
    /** @return LengthAwarePaginator<int, Guest> */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $attributes, ?int $createdBy = null): Guest;

    public function update(Guest $guest, array $attributes): Guest;

    public function details(Guest $guest): Guest;
}
