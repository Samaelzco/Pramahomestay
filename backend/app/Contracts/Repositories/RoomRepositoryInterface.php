<?php

namespace App\Contracts\Repositories;

use App\Models\Room;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

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

    /** @param array<int, array{url: string, path: string|null, sort_order: int}> $images */
    public function addImages(Room $room, array $images): Room;

    /**
     * @param  array<int, int>  $imageIds
     * @return array<int, string>
     */
    public function imagePaths(Room $room, array $imageIds): array;

    /** @param array<int, int> $imageIds */
    public function deleteImages(Room $room, array $imageIds): void;

    /** @param array<string, mixed> $attributes */
    public function update(Room $room, array $attributes): Room;

    public function delete(Room $room): void;

    public function hasAnyBooking(int $roomId): bool;

    public function slugExists(string $slug, ?int $ignoreId = null): bool;

    /** @return Collection<int, Room> */
    public function availableForPublic(?string $checkIn = null, ?string $checkOut = null, int $guests = 1): Collection;

    public function findActiveForPublic(int $id): ?Room;

    public function isAvailableForPublic(Room $room, ?string $checkIn = null, ?string $checkOut = null, int $guests = 1): bool;
}
