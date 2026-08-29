<?php

namespace App\Contracts\Repositories;

use App\Models\Room;
use App\Models\RoomBlock;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;

interface AvailabilityRepositoryInterface
{
    /** @return Collection<int, Room> */
    public function roomsForPeriod(CarbonImmutable $start, CarbonImmutable $end): Collection;

    public function hasBlockConflict(int $roomId, string $start, string $end, ?int $ignoreId = null): bool;

    /** @param array<string, mixed> $attributes */
    public function createBlock(array $attributes): RoomBlock;

    public function findBlockForUpdate(int $id): RoomBlock;

    public function deleteBlock(RoomBlock $block): void;
}
