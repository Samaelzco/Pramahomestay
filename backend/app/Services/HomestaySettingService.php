<?php

namespace App\Services;

use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Services\HomestaySettingServiceInterface;
use App\Models\HomestaySetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
        $logo = $attributes['logo'] ?? null;
        $removeLogo = (bool) ($attributes['remove_logo'] ?? false);
        unset($attributes['logo'], $attributes['remove_logo']);
        $newLogoPath = $logo instanceof UploadedFile ? $this->storeLogo($logo) : null;
        $current = $this->settings->current();
        $oldLogoPath = $current->logo_path;

        if ($newLogoPath) {
            $attributes['logo_path'] = $newLogoPath;
            $attributes['logo_url'] = Storage::disk('public')->url($newLogoPath);
        } elseif ($removeLogo) {
            $attributes['logo_path'] = null;
            $attributes['logo_url'] = null;
        }

        try {
            $updated = DB::transaction(fn (): HomestaySetting => $this->settings->update($current, $attributes));
        } catch (Throwable $exception) {
            $this->deleteLogo($newLogoPath);
            throw $exception;
        }

        if (($newLogoPath || $removeLogo) && $oldLogoPath) {
            $this->deleteLogo($oldLogoPath);
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

    private function deleteLogo(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
