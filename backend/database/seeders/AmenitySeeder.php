<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Wi-Fi', 'AC', 'Air panas', 'City view', 'Workspace', 'Smart TV', 'Bathtub'] as $name) {
            Amenity::query()->updateOrCreate(['name' => $name], ['slug' => Str::slug($name), 'is_active' => true]);
        }
    }
}
