<?php

namespace App\Contracts\Services;

use App\Models\Amenity;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AmenityServiceInterface
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $attributes): Amenity;

    public function update(Amenity $amenity, array $attributes): Amenity;

    public function setActive(Amenity $amenity, bool $isActive): Amenity;

    public function delete(Amenity $amenity): void;
}
