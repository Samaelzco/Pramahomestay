<?php

namespace Tests\Feature\Api;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\HomestaySetting;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicLandingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_data_is_public_and_only_exposes_active_inventory(): void
    {
        HomestaySetting::query()->create([
            'name' => 'Prama Homestay',
            'address' => 'Dalung, Bali',
            'maps_url' => 'https://maps.example.test/prama',
            'currency' => 'IDR',
            'bank_account_number' => '123456789',
        ]);
        $wifi = Amenity::query()->create(['name' => 'Wi-Fi', 'slug' => 'wi-fi', 'is_active' => true]);
        $inactiveAmenity = Amenity::query()->create(['name' => 'Hidden', 'slug' => 'hidden', 'is_active' => false]);
        $room = Room::factory()->create(['name' => 'Unit 101', 'status' => 'ready', 'capacity' => 2, 'is_active' => true]);
        $room->amenities()->sync([$wifi->id, $inactiveAmenity->id]);
        Room::factory()->create(['name' => 'Unit 102', 'status' => 'maintenance', 'is_active' => true]);
        Room::factory()->create(['name' => 'Unit 103', 'status' => 'ready', 'is_active' => false]);

        $this->getJson('/api/public/landing')
            ->assertOk()
            ->assertJsonPath('data.property.name', 'Prama Homestay')
            ->assertJsonPath('data.rooms.0.name', 'Unit 101')
            ->assertJsonCount(1, 'data.rooms')
            ->assertJsonCount(1, 'data.amenities')
            ->assertJsonPath('data.final_cta_media.image_url', null)
            ->assertJsonMissingPath('data.property.bank_account_number');
    }

    public function test_landing_availability_excludes_overlapping_bookings_and_validates_dates(): void
    {
        $bookedRoom = Room::factory()->create(['status' => 'ready', 'capacity' => 2]);
        $availableRoom = Room::factory()->create(['status' => 'ready', 'capacity' => 2]);
        $checkIn = now()->addDays(10)->toDateString();
        $middle = now()->addDays(11)->toDateString();
        $checkOut = now()->addDays(13)->toDateString();
        Booking::factory()->for($bookedRoom)->create([
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'status' => 'confirmed',
        ]);

        $this->getJson("/api/public/landing?check_in={$middle}&check_out={$checkOut}&guests=2")
            ->assertOk()
            ->assertJsonCount(1, 'data.rooms')
            ->assertJsonPath('data.rooms.0.id', $availableRoom->id);

        $this->getJson("/api/public/landing?check_in={$middle}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('check_out');
    }
}
