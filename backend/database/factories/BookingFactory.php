<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Booking> */
class BookingFactory extends Factory
{
    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('tomorrow', '+45 days');
        $nights = fake()->numberBetween(1, 5);
        $price = fake()->numberBetween(400_000, 1_500_000);

        return [
            'booking_code' => 'PRM-'.fake()->unique()->numerify('########'),
            'room_id' => Room::factory(),
            'guest_name' => fake()->name(),
            'guest_email' => fake()->safeEmail(),
            'guest_phone' => fake()->phoneNumber(),
            'check_in' => $checkIn,
            'check_out' => (clone $checkIn)->modify("+{$nights} days"),
            'guest_count' => 2,
            'price_per_night' => $price,
            'total_nights' => $nights,
            'total_amount' => $price * $nights,
            'status' => BookingStatus::Pending,
            'special_requests' => null,
            'internal_notes' => null,
            'created_by' => null,
        ];
    }
}
