<?php

namespace App\Contracts\Services;

use App\Models\Room;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface RoomServiceInterface
{
    /**
     * @param  array{search?: string, status?: string, type?: string, is_active?: bool}  $filters
     * @return LengthAwarePaginator<int, Room>
     */
    public function paginate(array $filters = [], int $perPage = 12): LengthAwarePaginator;

    public function findOrFail(int $id): Room;

    public function findByName(string $name): ?Room;

    /** @param array<string, mixed> $attributes */
    public function create(array $attributes): Room;

    /** @param array<string, mixed> $attributes */
    public function update(Room $room, array $attributes): Room;
}
