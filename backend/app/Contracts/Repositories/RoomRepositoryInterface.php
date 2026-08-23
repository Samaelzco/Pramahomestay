<?php

namespace App\Contracts\Repositories;

use App\Models\Room;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface RoomRepositoryInterface
{
    /**
     * @param  array{search?: string, status?: string, is_active?: bool}  $filters
     * @return LengthAwarePaginator<int, Room>
     */
    public function paginate(array $filters = [], int $perPage = 12): LengthAwarePaginator;

    public function findOrFail(int $id): Room;

    public function findForUpdate(int $id): Room;

    public function findByName(string $name): ?Room;

    /** @param array<string, mixed> $attributes */
    public function create(array $attributes): Room;

    public function syncAmenities(Room $room, array $amenityIds): Room;

    /** @param array<string, mixed> $attributes */
    public function update(Room $room, array $attributes): Room;

    public function delete(Room $room): void;

    public function hasAnyBooking(int $roomId): bool;

    public function slugExists(string $slug, ?int $ignoreId = null): bool;
}
