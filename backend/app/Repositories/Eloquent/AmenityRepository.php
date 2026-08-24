<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\AmenityRepositoryInterface;
use App\Models\Amenity;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AmenityRepository implements AmenityRepositoryInterface
{
    public function __construct(private readonly Amenity $model) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->newQuery()->withCount('rooms')
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $term = '%'.mb_strtolower($search).'%';
                $query->where(fn ($query) => $query->whereRaw('LOWER(name) LIKE ?', [$term])->orWhereRaw('LOWER(name_en) LIKE ?', [$term])->orWhereRaw('LOWER(description) LIKE ?', [$term])->orWhereRaw('LOWER(description_en) LIKE ?', [$term]));
            })
            ->when(array_key_exists('is_active', $filters), fn ($query) => $query->where('is_active', $filters['is_active']))
            ->orderBy('name')->paginate($perPage)->withQueryString();
    }

    public function findForUpdate(int $id): Amenity
    {
        return $this->model->newQuery()->lockForUpdate()->findOrFail($id);
    }

    public function create(array $attributes): Amenity
    {
        return $this->model->newQuery()->create($attributes);
    }

    public function update(Amenity $amenity, array $attributes): Amenity
    {
        $amenity->updateOrFail($attributes);

        return $amenity->refresh();
    }

    public function delete(Amenity $amenity): void
    {
        $amenity->deleteOrFail();
    }

    public function hasRooms(int $id): bool
    {
        return $this->model->newQuery()->findOrFail($id)->rooms()->exists();
    }

    public function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        return $this->model->newQuery()->where('slug', $slug)->when($ignoreId, fn ($query, int $id) => $query->whereKeyNot($id))->exists();
    }
}
