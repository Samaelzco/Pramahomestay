<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Models\Room;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RoomRepository implements RoomRepositoryInterface
{
    public function __construct(private readonly Room $model) {}

    public function paginate(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        return $this->model
            ->newQuery()
            ->with('amenities')
            ->withCount(['bookings as all_bookings_count' => fn ($query) => $query->withTrashed()])
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'ilike', "%{$search}%")
                        ->orWhere('description', 'ilike', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when(array_key_exists('is_active', $filters), fn ($query) => $query->where('is_active', $filters['is_active']))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findOrFail(int $id): Room
    {
        return $this->model->newQuery()->with('amenities')->findOrFail($id);
    }

    public function findForUpdate(int $id): Room
    {
        return $this->model->newQuery()->lockForUpdate()->findOrFail($id);
    }

    public function findByName(string $name): ?Room
    {
        return $this->model->newQuery()->where('name', $name)->first();
    }

    public function create(array $attributes): Room
    {
        return $this->model->newQuery()->create($attributes);
    }

    public function syncAmenities(Room $room, array $amenityIds): Room
    {
        $room->amenities()->sync($amenityIds);

        return $room->load('amenities');
    }

    public function update(Room $room, array $attributes): Room
    {
        $room->updateOrFail($attributes);

        return $room->refresh();
    }

    public function delete(Room $room): void
    {
        $room->deleteOrFail();
    }

    public function hasAnyBooking(int $roomId): bool
    {
        return $this->model->newQuery()->findOrFail($roomId)->bookings()->withTrashed()->exists();
    }

    public function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        return $this->model
            ->newQuery()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($query, int $id) => $query->whereKeyNot($id))
            ->exists();
    }
}
