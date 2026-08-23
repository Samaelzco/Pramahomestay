<?php

namespace Database\Factories;

use App\Enums\RoomStatus;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    public function definition(): array
    {
        $name = 'Unit '.fake()->unique()->numberBetween(100, 999);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'status' => fake()->randomElement(RoomStatus::cases()),
            'description' => fake()->paragraph(),
            'price_per_night' => fake()->numberBetween(350_000, 1_500_000),
            'capacity' => fake()->numberBetween(1, 6),
            'bed_count' => fake()->numberBetween(1, 3),
            'size_sqm' => fake()->randomFloat(2, 18, 80),
            'image_url' => null,
            'image_path' => null,
            'amenities' => ['Wi-Fi', 'AC', 'Air panas'],
            'is_active' => true,
        ];
    }
}
