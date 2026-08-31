<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\AvailabilityRepositoryInterface;
use App\Enums\BookingStatus;
use App\Models\Room;
use App\Models\RoomBlock;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;

class AvailabilityRepository implements AvailabilityRepositoryInterface
{
    public function __construct(
        private readonly Room $rooms,
        private readonly RoomBlock $blocks,
    ) {}

    public function roomsForPeriod(CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return $this->rooms->newQuery()
            ->with([
                'bookings' => fn ($query) => $query
                    ->where('status', '!=', BookingStatus::Cancelled->value)
                    ->whereDate('check_in', '<', $end->toDateString())
                    ->whereDate('check_out', '>', $start->toDateString())
                    ->orderBy('check_in'),
                'roomBlocks' => fn ($query) => $query
                    ->whereDate('start_date', '<', $end->toDateString())
                    ->whereDate('end_date', '>', $start->toDateString())
                    ->orderBy('start_date'),
            ])
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get();
    }

    public function hasBlockConflict(int $roomId, string $start, string $end, ?int $ignoreId = null): bool
    {
        return $this->blocks->newQuery()
            ->where('room_id', $roomId)
            ->whereDate('start_date', '<', $end)
            ->whereDate('end_date', '>', $start)
            ->when($ignoreId, fn ($query, int $id) => $query->whereKeyNot($id))
            ->exists();
    }

    public function createBlock(array $attributes): RoomBlock
    {
        return $this->blocks->newQuery()->create($attributes)->load('room');
    }

    public function findBlockForUpdate(int $id): RoomBlock
    {
        return $this->blocks->newQuery()->lockForUpdate()->findOrFail($id);
    }

    public function deleteBlock(RoomBlock $block): void
    {
        $block->deleteOrFail();
    }
}
