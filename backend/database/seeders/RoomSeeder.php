<?php

namespace Database\Seeders;

use App\Contracts\Services\RoomServiceInterface;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function __construct(private readonly RoomServiceInterface $rooms) {}

    public function run(): void
    {
        foreach ($this->rooms() as $attributes) {
            $room = $this->rooms->findByName($attributes['name']);

            $room === null
                ? $this->rooms->create($attributes)
                : $this->rooms->update($room, $attributes);
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function rooms(): array
    {
        return [
            [
                'name' => 'Unit 101',
                'type' => 'studio',
                'status' => 'ready',
                'description' => 'Studio tenang dengan cahaya alami dan sentuhan kayu hangat.',
                'price_per_night' => 650000,
                'capacity' => 2,
                'bed_count' => 1,
                'size_sqm' => 28,
                'image_url' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85',
                'amenities' => ['Wi-Fi', 'AC', 'City view'],
                'is_active' => true,
            ],
            [
                'name' => 'Unit 204',
                'type' => 'loft',
                'status' => 'occupied',
                'description' => 'Loft premium dengan area duduk luas untuk tamu yang menginap lebih lama.',
                'price_per_night' => 1250000,
                'capacity' => 4,
                'bed_count' => 2,
                'size_sqm' => 54,
                'image_url' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
                'amenities' => ['Wi-Fi', 'AC', 'Workspace', 'Smart TV'],
                'is_active' => true,
            ],
            [
                'name' => 'Unit 102',
                'type' => 'deluxe',
                'status' => 'cleaning',
                'description' => 'Kamar deluxe dengan kamar mandi lapang dan suasana yang terang.',
                'price_per_night' => 850000,
                'capacity' => 2,
                'bed_count' => 1,
                'size_sqm' => 34,
                'image_url' => 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
                'amenities' => ['Wi-Fi', 'AC', 'Bathtub'],
                'is_active' => true,
            ],
        ];
    }
}
