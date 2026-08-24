<?php

namespace Tests\Feature\Api;

use App\Models\Amenity;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalAmenityApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AuthorizationSeeder::class);
    }

    private function actingAsAdmin(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        Sanctum::actingAs($user, ['internal']);
    }

    public function test_amenities_require_authentication_and_permission(): void
    {
        $this->getJson('/api/internal/amenities')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/internal/amenities')->assertForbidden();
    }

    public function test_admin_can_create_filter_update_and_toggle_amenity(): void
    {
        $this->actingAsAdmin();
        $id = $this->postJson('/api/internal/amenities', ['name' => 'Air panas', 'name_en' => 'Hot water', 'description' => 'Tersedia setiap saat.', 'description_en' => 'Available at all times.', 'is_active' => true])
            ->assertCreated()->assertJsonPath('data.name', 'Air panas')->assertJsonPath('data.name_en', 'Hot water')->assertJsonPath('data.description_en', 'Available at all times.')->json('data.id');
        $this->getJson('/api/internal/amenities?search=panas')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/internal/amenities?search=water')->assertOk()->assertJsonCount(1, 'data');
        $this->putJson("/api/internal/amenities/{$id}", ['name' => 'Shower air panas', 'name_en' => 'Hot shower', 'description' => null, 'description_en' => null, 'is_active' => true])
            ->assertOk()->assertJsonPath('data.slug', 'shower-air-panas');
        $this->patchJson("/api/internal/amenities/{$id}/activation", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
    }

    public function test_room_can_sync_amenities_and_resource_returns_master_data(): void
    {
        $this->actingAsAdmin();
        $amenity = Amenity::query()->create(['name' => 'Wi-Fi', 'slug' => 'wi-fi', 'is_active' => true]);
        $room = Room::factory()->create();
        $payload = ['name' => $room->name, 'status' => $room->status->value, 'description' => $room->description, 'price_per_night' => $room->price_per_night, 'capacity' => $room->capacity, 'bed_count' => $room->bed_count, 'image_url' => null, 'amenity_ids' => [$amenity->id], 'is_active' => true];
        $this->putJson("/api/internal/rooms/{$room->id}", $payload)->assertOk()->assertJsonPath('data.amenities.0.name', 'Wi-Fi');
        $this->assertDatabaseHas('amenity_room', ['room_id' => $room->id, 'amenity_id' => $amenity->id]);
    }

    public function test_unused_amenity_can_be_deleted_but_used_amenity_cannot(): void
    {
        $this->actingAsAdmin();
        $unused = Amenity::query()->create(['name' => 'Brankas', 'slug' => 'brankas', 'is_active' => true]);
        $used = Amenity::query()->create(['name' => 'AC', 'slug' => 'ac', 'is_active' => true]);
        $room = Room::factory()->create();
        $room->amenities()->attach($used);
        $this->deleteJson("/api/internal/amenities/{$unused->id}")->assertOk();
        $this->deleteJson("/api/internal/amenities/{$used->id}")->assertUnprocessable()->assertJsonValidationErrors('delete');
    }
}
