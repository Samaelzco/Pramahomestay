<?php

namespace App\Services;

use App\Contracts\Repositories\AmenityRepositoryInterface;
use App\Contracts\Services\AmenityServiceInterface;
use App\Models\Amenity;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AmenityService implements AmenityServiceInterface
{
    public function __construct(private readonly AmenityRepositoryInterface $amenities) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->amenities->paginate($filters, $perPage);
    }

    public function create(array $attributes): Amenity
    {
        return DB::transaction(function () use ($attributes): Amenity {
            $attributes['slug'] = $this->uniqueSlug($attributes['name']);

            return $this->amenities->create($attributes);
        });
    }

    public function update(Amenity $amenity, array $attributes): Amenity
    {
        return DB::transaction(function () use ($amenity, $attributes): Amenity {
            if ($attributes['name'] !== $amenity->name) {
                $attributes['slug'] = $this->uniqueSlug($attributes['name'], $amenity->id);
            }

            return $this->amenities->update($amenity, $attributes);
        });
    }

    public function setActive(Amenity $amenity, bool $isActive): Amenity
    {
        return DB::transaction(fn (): Amenity => $this->amenities->update($this->amenities->findForUpdate($amenity->id), ['is_active' => $isActive]));
    }

    public function delete(Amenity $amenity): void
    {
        DB::transaction(function () use ($amenity): void {
            $locked = $this->amenities->findForUpdate($amenity->id);
            if ($this->amenities->hasRooms($locked->id)) {
                throw ValidationException::withMessages(['delete' => 'Fasilitas tidak dapat dihapus karena masih digunakan oleh kamar. Lepaskan dari kamar atau nonaktifkan sebagai gantinya.']);
            } $this->amenities->delete($locked);
        });
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;
        while ($this->amenities->slugExists($slug, $ignoreId)) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
