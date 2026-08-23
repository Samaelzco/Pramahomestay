<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Models\HomestaySetting;

class HomestaySettingRepository implements HomestaySettingRepositoryInterface
{
    public function __construct(private readonly HomestaySetting $model) {}

    public function current(): HomestaySetting
    {
        return $this->model->newQuery()->firstOrCreate([], [
            'name' => 'Prama Homestay',
            'address' => 'Jl. Baja Taki III No.18, Dalung, Kec. Denpasar Bar., Kota Denpasar, Bali 80117',
            'maps_url' => 'https://maps.app.goo.gl/Nfsfk4UYLfo3zuEB8',
            'timezone' => 'Asia/Makassar',
            'currency' => 'IDR',
            'booking_code_prefix' => 'PRM',
            'payment_code_prefix' => 'PAY',
        ]);
    }

    public function update(HomestaySetting $settings, array $attributes): HomestaySetting
    {
        $settings->updateOrFail($attributes);

        return $settings->refresh();
    }
}
