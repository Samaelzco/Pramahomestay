<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\HomestaySettingServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateHomestaySettingRequest;
use App\Http\Resources\HomestaySettingResource;
use Illuminate\Http\Request;

class HomestaySettingController extends Controller
{
    public function __construct(private readonly HomestaySettingServiceInterface $settings) {}

    public function show(Request $request): HomestaySettingResource
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        return new HomestaySettingResource($this->settings->current());
    }

    public function update(UpdateHomestaySettingRequest $request): HomestaySettingResource
    {
        return (new HomestaySettingResource($this->settings->update($request->validated())))
            ->additional(['message' => 'Pengaturan homestay berhasil disimpan.']);
    }
}
