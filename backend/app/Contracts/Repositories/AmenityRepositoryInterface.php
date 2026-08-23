<?php

namespace App\Contracts\Repositories;

use App\Models\Amenity;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AmenityRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function findForUpdate(int $id): Amenity;

    public function create(array $attributes): Amenity;

    public function update(Amenity $amenity, array $attributes): Amenity;

    public function delete(Amenity $amenity): void;

    public function slugExists(string $slug, ?int $ignoreId = null): bool;

    public function hasRooms(int $id): bool;
}
