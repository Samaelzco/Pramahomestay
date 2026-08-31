<?php

namespace App\Contracts\Repositories;

use App\Models\HomestaySetting;

interface HomestaySettingRepositoryInterface
{
    public function current(): HomestaySetting;

    /** @param array<string, mixed> $attributes */
    public function update(HomestaySetting $settings, array $attributes): HomestaySetting;
}
