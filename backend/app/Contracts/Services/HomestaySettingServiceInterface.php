<?php

namespace App\Contracts\Services;

use App\Models\HomestaySetting;

interface HomestaySettingServiceInterface
{
    public function current(): HomestaySetting;

    /** @param array<string, mixed> $attributes */
    public function update(array $attributes): HomestaySetting;
}
