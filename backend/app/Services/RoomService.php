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
use RuntimeException;
use Throwable;

class RoomService implements RoomServiceInterface
{
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
        $image = $this->extractImage($attributes);
        unset($attributes['remove_image']);
        $imagePath = $image ? $this->storeImage($image) : null;

        if ($imagePath) {
            $attributes['image_path'] = $imagePath;
            $attributes['image_url'] = Storage::disk('public')->url($imagePath);
        }

        try {
            return DB::transaction(function () use ($attributes): Room {
                $attributes['slug'] = $this->uniqueSlug((string) $attributes['name']);

                return $this->rooms->create($attributes);
            });
        } catch (Throwable $exception) {
            $this->deleteImage($imagePath);
            throw $exception;
        }
    }

    public function update(Room $room, array $attributes): Room
    {
        $image = $this->extractImage($attributes);
        $removeImage = (bool) ($attributes['remove_image'] ?? false);
        unset($attributes['remove_image']);

        $newImagePath = $image ? $this->storeImage($image) : null;
        $oldImagePath = $room->image_path;

        if ($newImagePath) {
            $attributes['image_path'] = $newImagePath;
            $attributes['image_url'] = Storage::disk('public')->url($newImagePath);
        } elseif ($removeImage) {
            $attributes['image_path'] = null;
            $attributes['image_url'] = null;
        }

        try {
            $updated = DB::transaction(function () use ($room, $attributes): Room {
                if (isset($attributes['name']) && $attributes['name'] !== $room->name) {
                    $attributes['slug'] = $this->uniqueSlug((string) $attributes['name'], $room->id);
                }

                return $this->rooms->update($room, $attributes);
            });
        } catch (Throwable $exception) {
            $this->deleteImage($newImagePath);
            throw $exception;
        }

        if (($newImagePath || $removeImage) && $oldImagePath) {
            $this->deleteImage($oldImagePath);
        }

        return $updated;
    }

    public function setActive(Room $room, bool $isActive): Room
    {
        return DB::transaction(function () use ($room, $isActive): Room {
            $locked = $this->rooms->findForUpdate($room->id);

            return $this->rooms->update($locked, ['is_active' => $isActive]);
        });
    }

    /** @param array<string, mixed> $attributes */
    private function extractImage(array &$attributes): ?UploadedFile
    {
        $image = $attributes['image'] ?? null;
        unset($attributes['image']);

        return $image instanceof UploadedFile ? $image : null;
    }

    private function storeImage(UploadedFile $image): string
    {
        $path = $image->storePublicly('rooms', 'public');

        if (! $path) {
            throw new RuntimeException('Gambar kamar gagal disimpan.');
        }

        return $path;
    }

    private function deleteImage(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
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
