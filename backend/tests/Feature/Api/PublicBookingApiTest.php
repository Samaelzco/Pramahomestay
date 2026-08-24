<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Guest;
use App\Models\HomestaySetting;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicBookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_create_pending_booking_without_login(): void
    {
        HomestaySetting::query()->create([
            'name' => 'Prama Homestay', 'address' => 'Bali', 'maps_url' => 'https://maps.example.test',
            'currency' => 'IDR', 'booking_code_prefix' => 'PRM', 'payment_code_prefix' => 'PAY',
        ]);
        $room = Room::factory()->create(['status' => 'ready', 'is_active' => true, 'capacity' => 2, 'price_per_night' => 650000]);
        $checkIn = now()->addDays(5)->toDateString();
        $checkOut = now()->addDays(8)->toDateString();

        $this->postJson('/api/public/bookings', [
            'room_id' => $room->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guest_count' => 2,
            'full_name' => 'Made Pranata',
            'email' => 'MADE@example.com',
            'phone' => '+62 812 3456 7890',
            'special_requests' => 'Late arrival',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.total_nights', 3)
            ->assertJsonPath('data.total_amount', '1950000.00');

        $this->assertDatabaseHas('guests', ['email' => 'made@example.com', 'full_name' => 'Made Pranata']);
        $this->assertDatabaseHas('bookings', ['room_id' => $room->id, 'status' => 'pending', 'guest_count' => 2]);
    }

    public function test_public_booking_reuses_guest_and_rejects_conflicts_and_invalid_capacity(): void
    {
        HomestaySetting::query()->create([
            'name' => 'Prama Homestay', 'address' => 'Bali', 'maps_url' => 'https://maps.example.test',
            'currency' => 'IDR', 'booking_code_prefix' => 'PRM', 'payment_code_prefix' => 'PAY',
        ]);
        $room = Room::factory()->create(['status' => 'ready', 'is_active' => true, 'capacity' => 2]);
        $guest = Guest::factory()->create(['email' => 'guest@example.com']);
        $checkIn = now()->addDays(5)->toDateString();
        $checkOut = now()->addDays(7)->toDateString();
        Booking::factory()->for($room)->for($guest)->create(['check_in' => $checkIn, 'check_out' => $checkOut, 'status' => 'confirmed']);

        $payload = [
            'room_id' => $room->id, 'check_in' => $checkIn, 'check_out' => $checkOut,
            'guest_count' => 2, 'full_name' => 'Guest Updated', 'email' => 'guest@example.com', 'phone' => '+62 811 1111',
        ];
        $this->postJson('/api/public/bookings', $payload)->assertUnprocessable()->assertJsonValidationErrors('check_in');
        $this->postJson('/api/public/bookings', [...$payload, 'check_in' => now()->addDays(8)->toDateString(), 'check_out' => now()->addDays(9)->toDateString(), 'guest_count' => 3])
            ->assertUnprocessable()->assertJsonValidationErrors('guest_count');
        $this->assertSame(1, Guest::query()->where('email', 'guest@example.com')->count());
    }
}
