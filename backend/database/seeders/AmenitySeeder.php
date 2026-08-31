<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $amenities = [
            ['name' => 'Wi-Fi', 'name_en' => 'Wi-Fi'],
            ['name' => 'AC', 'name_en' => 'Air conditioning'],
            ['name' => 'Air panas', 'name_en' => 'Hot water'],
            ['name' => 'City view', 'name_en' => 'City view'],
            ['name' => 'Workspace', 'name_en' => 'Workspace'],
            ['name' => 'Smart TV', 'name_en' => 'Smart TV'],
            ['name' => 'Bathtub', 'name_en' => 'Bathtub'],
        ];

        foreach ($amenities as $amenity) {
            Amenity::query()->updateOrCreate(['name' => $amenity['name']], [...$amenity, 'slug' => Str::slug($amenity['name']), 'is_active' => true]);
        }
    }
}
