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

    public function test_public_room_detail_exposes_active_room_content_and_availability(): void
    {
        HomestaySetting::query()->create([
            'name' => 'Prama Homestay',
            'address' => 'Dalung, Bali',
            'maps_url' => 'https://maps.example.test/prama',
            'currency' => 'IDR',
        ]);
        $amenity = Amenity::query()->create([
            'name' => 'Wi-Fi',
            'name_en' => 'Wi-Fi',
            'slug' => 'wi-fi',
            'description' => 'Internet cepat.',
            'is_active' => true,
        ]);
        $room = Room::factory()->create([
            'name' => 'Unit 101',
            'status' => 'ready',
            'capacity' => 2,
            'is_active' => true,
        ]);
        $room->amenities()->sync([$amenity->id]);
        $room->images()->create(['url' => 'https://example.test/unit-101.jpg', 'sort_order' => 0]);
        $checkIn = now()->addDays(10)->toDateString();
        $checkOut = now()->addDays(12)->toDateString();
        Booking::factory()->for($room)->create([
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'status' => 'confirmed',
        ]);

        $this->getJson("/api/public/rooms/{$room->id}?check_in={$checkIn}&check_out={$checkOut}&guests=2")
            ->assertOk()
            ->assertJsonPath('data.property.name', 'Prama Homestay')
            ->assertJsonPath('data.room.name', 'Unit 101')
            ->assertJsonPath('data.room.amenities.0.description', 'Internet cepat.')
            ->assertJsonPath('data.room.images.0.url', 'https://example.test/unit-101.jpg')
            ->assertJsonPath('data.availability.checked', true)
            ->assertJsonPath('data.availability.is_available', false)
            ->assertJsonPath('data.availability.reason', 'dates')
            ->assertJsonMissingPath('data.room.is_active');
    }

    public function test_public_room_detail_hides_inactive_and_maintenance_rooms(): void
    {
        $inactive = Room::factory()->create(['status' => 'ready', 'is_active' => false]);
        $maintenance = Room::factory()->create(['status' => 'maintenance', 'is_active' => true]);

        $this->getJson("/api/public/rooms/{$inactive->id}")->assertNotFound();
        $this->getJson("/api/public/rooms/{$maintenance->id}")->assertNotFound();
    }
}
