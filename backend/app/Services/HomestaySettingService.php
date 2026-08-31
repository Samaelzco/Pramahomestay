<?php

namespace App\Services;

use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Services\HomestaySettingServiceInterface;
use App\Models\HomestaySetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class HomestaySettingService implements HomestaySettingServiceInterface
{
    public function __construct(private readonly HomestaySettingRepositoryInterface $settings) {}

    public function current(): HomestaySetting
    {
        return $this->settings->current();
    }

    public function update(array $attributes): HomestaySetting
    {
        if (array_key_exists('mail_password', $attributes) && blank($attributes['mail_password'])) {
            unset($attributes['mail_password']);
        }
        $logo = $attributes['logo'] ?? null;
        $removeLogo = (bool) ($attributes['remove_logo'] ?? false);
        $heroImageUploads = array_values(array_filter($attributes['hero_images'] ?? [], fn (mixed $file): bool => $file instanceof UploadedFile));
        $removeHeroImageIds = $attributes['remove_hero_image_ids'] ?? [];
        $heroVideo = $attributes['hero_video'] ?? null;
        $removeHeroVideo = (bool) ($attributes['remove_hero_video'] ?? false);
        $finalCtaImage = $attributes['final_cta_image'] ?? null;
        $removeFinalCtaImage = (bool) ($attributes['remove_final_cta_image'] ?? false);
        unset($attributes['logo'], $attributes['remove_logo'], $attributes['hero_images'], $attributes['remove_hero_image_ids'], $attributes['hero_video'], $attributes['remove_hero_video'], $attributes['final_cta_image'], $attributes['remove_final_cta_image']);

        $current = $this->settings->current();
        $oldLogoPath = $current->logo_path;
        $oldHeroVideoPath = $current->hero_video_path;
        $oldFinalCtaImagePath = $current->final_cta_image_path;
        $currentHeroImages = is_array($current->hero_images) ? $current->hero_images : [];
        $retainedHeroImages = array_values(array_filter($currentHeroImages, fn (array $image): bool => ! in_array($image['id'] ?? null, $removeHeroImageIds, true)));
        $removedHeroImagePaths = array_values(array_filter(array_map(
            fn (array $image): ?string => in_array($image['id'] ?? null, $removeHeroImageIds, true) ? ($image['path'] ?? null) : null,
            $currentHeroImages,
        )));

        if (count($retainedHeroImages) + count($heroImageUploads) > 5) {
            throw ValidationException::withMessages(['hero_images' => ['Maksimal 5 gambar hero dapat disimpan.']]);
        }

        $mediaType = $attributes['hero_media_type'] ?? $current->hero_media_type ?? 'image';
        $hasEffectiveVideo = $heroVideo instanceof UploadedFile || (! $removeHeroVideo && filled($current->hero_video_url));
        if ($mediaType === 'video' && ! $hasEffectiveVideo) {
            throw ValidationException::withMessages(['hero_video' => ['Unggah satu video sebelum mengaktifkan mode video.']]);
        }

        $newLogoPath = null;
        $newHeroImages = [];
        $newHeroVideoPath = null;
        $newFinalCtaImagePath = null;

        try {
            $newLogoPath = $logo instanceof UploadedFile ? $this->storeLogo($logo) : null;
            foreach ($heroImageUploads as $image) {
                $newHeroImages[] = $this->storeHeroImage($image);
            }
            $newHeroVideoPath = $heroVideo instanceof UploadedFile ? $this->storeHeroVideo($heroVideo) : null;
            $newFinalCtaImagePath = $finalCtaImage instanceof UploadedFile ? $this->storeFinalCtaImage($finalCtaImage) : null;

            $attributes['hero_images'] = [...$retainedHeroImages, ...$newHeroImages];

            if ($newLogoPath) {
                $attributes['logo_path'] = $newLogoPath;
                $attributes['logo_url'] = Storage::disk('public')->url($newLogoPath);
            } elseif ($removeLogo) {
                $attributes['logo_path'] = null;
                $attributes['logo_url'] = null;
            }

            if ($newHeroVideoPath) {
                $attributes['hero_video_path'] = $newHeroVideoPath;
                $attributes['hero_video_url'] = Storage::disk('public')->url($newHeroVideoPath);
            } elseif ($removeHeroVideo) {
                $attributes['hero_video_path'] = null;
                $attributes['hero_video_url'] = null;
            }

            if ($newFinalCtaImagePath) {
                $attributes['final_cta_image_path'] = $newFinalCtaImagePath;
                $attributes['final_cta_image_url'] = Storage::disk('public')->url($newFinalCtaImagePath);
            } elseif ($removeFinalCtaImage) {
                $attributes['final_cta_image_path'] = null;
                $attributes['final_cta_image_url'] = null;
            }

            $updated = DB::transaction(fn (): HomestaySetting => $this->settings->update($current, $attributes));
        } catch (Throwable $exception) {
            $this->deleteFiles(array_filter([
                $newLogoPath,
                $newHeroVideoPath,
                $newFinalCtaImagePath,
                ...array_column($newHeroImages, 'path'),
            ]));
            throw $exception;
        }

        if (($newLogoPath || $removeLogo) && $oldLogoPath) {
            $this->deleteFiles([$oldLogoPath]);
        }
        $this->deleteFiles($removedHeroImagePaths);
        if (($newHeroVideoPath || $removeHeroVideo) && $oldHeroVideoPath) {
            $this->deleteFiles([$oldHeroVideoPath]);
        }
        if (($newFinalCtaImagePath || $removeFinalCtaImage) && $oldFinalCtaImagePath) {
            $this->deleteFiles([$oldFinalCtaImagePath]);
        }

        return $updated;
    }

    private function storeLogo(UploadedFile $logo): string
    {
        $path = $logo->storePublicly('settings', 'public');
        if (! $path) {
            throw new RuntimeException('Logo gagal disimpan.');
        }

        return $path;
    }

    /** @return array{id: string, url: string, path: string} */
    private function storeHeroImage(UploadedFile $image): array
    {
        $path = $image->storePublicly('settings/hero', 'public');
        if (! $path) {
            throw new RuntimeException('Gambar hero gagal disimpan.');
        }

        return ['id' => (string) Str::uuid(), 'url' => Storage::disk('public')->url($path), 'path' => $path];
    }

    private function storeHeroVideo(UploadedFile $video): string
    {
        $path = $video->storePublicly('settings/hero', 'public');
        if (! $path) {
            throw new RuntimeException('Video hero gagal disimpan.');
        }

        return $path;
    }

    private function storeFinalCtaImage(UploadedFile $image): string
    {
        $path = $image->storePublicly('settings/final-cta', 'public');
        if (! $path) {
            throw new RuntimeException('Gambar CTA penutup gagal disimpan.');
        }

        return $path;
    }

    /** @param array<int, string|null> $paths */
    private function deleteFiles(array $paths): void
    {
        $paths = array_values(array_filter($paths));
        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
        }
    }
}
