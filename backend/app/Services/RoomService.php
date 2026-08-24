<?php

namespace App\Services;

use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Services\RoomServiceInterface;
use App\Models\Room;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class RoomService implements RoomServiceInterface
{
    private const MAX_IMAGES = 10;

    public function __construct(private readonly RoomRepositoryInterface $rooms) {}

    public function paginate(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        return $this->rooms->paginate($filters, $perPage);
    }

    public function findOrFail(int $id): Room
    {
        return $this->rooms->findOrFail($id);
    }

    public function findByName(string $name): ?Room
    {
        return $this->rooms->findByName($name);
    }

    public function create(array $attributes): Room
    {
        $amenityIds = $attributes['amenity_ids'] ?? [];
        unset($attributes['amenity_ids']);
        $images = $this->extractImages($attributes);
        $externalImageUrl = $this->extractExternalImageUrl($attributes);
        if (count($images) + ($externalImageUrl !== null ? 1 : 0) > self::MAX_IMAGES) {
            throw ValidationException::withMessages(['images' => 'Maksimal 10 foto untuk setiap kamar.']);
        }
        $storedImages = $this->storeImages($images);
        $imageRecords = $this->imageRecords($storedImages, $externalImageUrl);

        try {
            return DB::transaction(function () use ($attributes, $amenityIds, $imageRecords): Room {
                $attributes['slug'] = $this->uniqueSlug((string) $attributes['name']);
                $room = $this->rooms->syncAmenities($this->rooms->create($attributes), $amenityIds);

                return $this->rooms->addImages($room, $imageRecords);
            });
        } catch (Throwable $exception) {
            $this->deleteImages(array_column($storedImages, 'path'));
            throw $exception;
        }
    }

    public function update(Room $room, array $attributes): Room
    {
        $amenityIds = $attributes['amenity_ids'] ?? [];
        unset($attributes['amenity_ids']);
        $images = $this->extractImages($attributes);
        $externalImageUrl = $this->extractExternalImageUrl($attributes);
        $room->loadMissing('images');
        $removeImageIds = (bool) ($attributes['remove_image'] ?? false)
            ? $room->images->pluck('id')->all()
            : array_values(array_unique(array_map('intval', $attributes['remove_image_ids'] ?? [])));
        unset($attributes['remove_image'], $attributes['remove_image_ids']);

        if ($room->images->whereIn('id', $removeImageIds)->count() !== count($removeImageIds)) {
            throw ValidationException::withMessages(['remove_image_ids' => 'Salah satu gambar tidak terdaftar pada kamar ini.']);
        }

        $appendExternalImage = $externalImageUrl !== null && ! $room->images->contains('url', $externalImageUrl);
        $finalImageCount = $room->images->count() - count($removeImageIds) + count($images) + ($appendExternalImage ? 1 : 0);
        if ($finalImageCount > self::MAX_IMAGES) {
            throw ValidationException::withMessages(['images' => 'Maksimal 10 foto untuk setiap kamar. Hapus beberapa foto sebelum menambahkan yang baru.']);
        }

        $removedPaths = $this->rooms->imagePaths($room, $removeImageIds);
        $storedImages = $this->storeImages($images);
        $startOrder = ((int) $room->images->max('sort_order')) + 1;
        $imageRecords = $this->imageRecords($storedImages, $appendExternalImage ? $externalImageUrl : null, $startOrder);

        try {
            $updated = DB::transaction(function () use ($room, $attributes, $amenityIds, $removeImageIds, $imageRecords): Room {
                if (isset($attributes['name']) && $attributes['name'] !== $room->name) {
                    $attributes['slug'] = $this->uniqueSlug((string) $attributes['name'], $room->id);
                }

                $updated = $this->rooms->syncAmenities($this->rooms->update($room, $attributes), $amenityIds);
                $this->rooms->deleteImages($updated, $removeImageIds);

                return $this->rooms->addImages($updated, $imageRecords);
            });
        } catch (Throwable $exception) {
            $this->deleteImages(array_column($storedImages, 'path'));
            throw $exception;
        }

        $this->deleteImages($removedPaths);

        return $updated;
    }

    public function setActive(Room $room, bool $isActive): Room
    {
        return DB::transaction(function () use ($room, $isActive): Room {
            $locked = $this->rooms->findForUpdate($room->id);

            return $this->rooms->update($locked, ['is_active' => $isActive]);
        });
    }

    public function delete(Room $room): void
    {
        DB::transaction(function () use ($room): void {
            $locked = $this->rooms->findForUpdate($room->id);
            if ($this->rooms->hasAnyBooking($locked->id)) {
                throw ValidationException::withMessages(['delete' => 'Kamar tidak dapat dihapus karena sudah memiliki riwayat booking. Nonaktifkan kamar sebagai gantinya.']);
            }

            $this->rooms->delete($locked);
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<int, UploadedFile>
     */
    private function extractImages(array &$attributes): array
    {
        $images = $attributes['images'] ?? [];
        unset($attributes['images']);

        return array_values(array_filter(is_array($images) ? $images : [], fn (mixed $image): bool => $image instanceof UploadedFile));
    }

    /** @param array<string, mixed> $attributes */
    private function extractExternalImageUrl(array &$attributes): ?string
    {
        $url = $attributes['image_url'] ?? null;
        unset($attributes['image_url']);

        return is_string($url) && $url !== '' ? $url : null;
    }

    /**
     * @param  array<int, UploadedFile>  $images
     * @return array<int, array{url: string, path: string}>
     */
    private function storeImages(array $images): array
    {
        $stored = [];

        try {
            foreach ($images as $image) {
                $path = $image->storePublicly('rooms', 'public');

                if (! $path) {
                    throw new RuntimeException('Foto kamar gagal disimpan.');
                }

                $stored[] = ['url' => Storage::disk('public')->url($path), 'path' => $path];
            }
        } catch (Throwable $exception) {
            $this->deleteImages(array_column($stored, 'path'));
            throw $exception;
        }

        return $stored;
    }

    /**
     * @param  array<int, array{url: string, path: string}>  $storedImages
     * @return array<int, array{url: string, path: string|null, sort_order: int}>
     */
    private function imageRecords(array $storedImages, ?string $externalImageUrl, int $startOrder = 0): array
    {
        $records = [];
        foreach ($storedImages as $image) {
            $records[] = ['url' => $image['url'], 'path' => $image['path'], 'sort_order' => $startOrder + count($records)];
        }

        if ($externalImageUrl !== null) {
            $records[] = ['url' => $externalImageUrl, 'path' => null, 'sort_order' => $startOrder + count($records)];
        }

        return $records;
    }

    /** @param array<int, string|null> $paths */
    private function deleteImages(array $paths): void
    {
        $paths = array_values(array_filter($paths));
        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
        }
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;

        while ($this->rooms->slugExists($slug, $ignoreId)) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
