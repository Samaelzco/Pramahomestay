<?php

namespace Database\Factories;

use App\Models\Room;
use App\Models\RoomBlock;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<RoomBlock> */
class RoomBlockFactory extends Factory
{
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('today', '+30 days');

        return [
            'room_id' => Room::factory(),
            'title' => 'Perawatan kamar',
            'start_date' => $start,
            'end_date' => (clone $start)->modify('+2 days'),
            'notes' => null,
            'created_by' => null,
        ];
    }
}
