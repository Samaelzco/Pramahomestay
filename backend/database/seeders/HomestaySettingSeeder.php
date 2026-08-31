<?php

namespace Database\Seeders;

use App\Models\HomestaySetting;
use Illuminate\Database\Seeder;

class HomestaySettingSeeder extends Seeder
{
    public function run(): void
    {
        HomestaySetting::query()->firstOrCreate([], [
            'name' => 'Prama Homestay',
            'address' => 'Jl. Baja Taki III No.18, Dalung, Kec. Denpasar Bar., Kota Denpasar, Bali 80117',
            'maps_url' => 'https://maps.app.goo.gl/Nfsfk4UYLfo3zuEB8',
            'timezone' => 'Asia/Makassar',
            'currency' => 'IDR',
            'booking_code_prefix' => 'PRM',
            'payment_code_prefix' => 'PAY',
        ]);
    }
}
