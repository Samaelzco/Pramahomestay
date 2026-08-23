<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalRoomApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_room_endpoints_require_authentication_and_permissions(): void
    {
        $this->getJson('/api/internal/rooms')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/internal/rooms')->assertForbidden();
    }

    public function test_authorized_user_can_filter_create_view_and_update_rooms(): void
    {
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);

        Room::factory()->create(['name' => 'Unit 101', 'slug' => 'unit-101', 'status' => 'ready']);
        Room::factory()->create(['name' => 'Unit 102', 'slug' => 'unit-102', 'status' => 'cleaning']);

        $this->getJson('/api/internal/rooms?status=ready')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Unit 101');

        $created = $this->postJson('/api/internal/rooms', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.name', 'Unit 301')
            ->assertJsonPath('data.slug', 'unit-301');

        $roomId = $created->json('data.id');

        $this->getJson("/api/internal/rooms/{$roomId}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Unit 301');

        $this->putJson("/api/internal/rooms/{$roomId}", [
            ...$this->payload(),
            'name' => 'Unit 305',
            'status' => 'maintenance',
        ])
            ->assertOk()
            ->assertJsonPath('data.slug', 'unit-305')
            ->assertJsonPath('data.status', 'maintenance');
    }

    public function test_room_payload_is_validated(): void
    {
        $this->seed(AuthorizationSeeder::class);
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Sanctum::actingAs($staff, ['internal']);

        $this->postJson('/api/internal/rooms', [
            'name' => '',
            'price_per_night' => -1,
            'capacity' => 0,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'status', 'price_per_night', 'capacity']);
    }

    public function test_authorized_user_can_deactivate_and_reactivate_a_room(): void
    {
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);
        $room = Room::factory()->create(['is_active' => true]);

        $this->patchJson("/api/internal/rooms/{$room->id}/activation", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->patchJson("/api/internal/rooms/{$room->id}/activation", ['is_active' => true])
            ->assertOk()
            ->assertJsonPath('data.is_active', true);
    }

    public function test_room_without_booking_can_be_soft_deleted(): void
    {
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);
        $room = Room::factory()->create();

        $this->getJson('/api/internal/rooms')
            ->assertOk()
            ->assertJsonPath('data.0.can_delete', true);

        $this->deleteJson("/api/internal/rooms/{$room->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Kamar berhasil dihapus.');

        $this->assertSoftDeleted($room);
        $this->getJson("/api/internal/rooms/{$room->id}")->assertNotFound();
    }

    public function test_room_with_booking_cannot_be_deleted(): void
    {
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);
        $room = Room::factory()->create();
        Booking::factory()->for($room)->create();

        $this->getJson('/api/internal/rooms')
            ->assertOk()
            ->assertJsonPath('data.0.can_delete', false);

        $this->deleteJson("/api/internal/rooms/{$room->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('delete');

        $this->assertNotSoftDeleted($room);
    }

    public function test_authorized_user_can_upload_replace_and_remove_a_room_image(): void
    {
        Storage::fake('public');
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);

        $payload = $this->payload();
        unset($payload['image_url']);
        $payload['image'] = UploadedFile::fake()->image('unit-301.jpg', 1200, 800)->size(500);

        $created = $this->post('/api/internal/rooms', $payload, ['Accept' => 'application/json'])
            ->assertCreated();

        $room = Room::query()->findOrFail($created->json('data.id'));
        $firstPath = $room->image_path;
        $this->assertNotNull($firstPath);
        Storage::disk('public')->assertExists($firstPath);
        $created->assertJsonPath('data.image_url', Storage::disk('public')->url($firstPath));

        $replacementPayload = $this->payload();
        unset($replacementPayload['image_url']);
        $replacementPayload['_method'] = 'PUT';
        $replacementPayload['image'] = UploadedFile::fake()->image('replacement.webp', 1200, 800)->size(600);

        $this->post("/api/internal/rooms/{$room->id}", $replacementPayload, ['Accept' => 'application/json'])
            ->assertOk();

        $room->refresh();
        $replacementPath = $room->image_path;
        $this->assertNotSame($firstPath, $replacementPath);
        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($replacementPath);

        $removePayload = $this->payload();
        unset($removePayload['image_url']);
        $removePayload['_method'] = 'PUT';
        $removePayload['remove_image'] = true;

        $this->post("/api/internal/rooms/{$room->id}", $removePayload, ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.image_url', null);

        $room->refresh();
        $this->assertNull($room->image_path);
        Storage::disk('public')->assertMissing($replacementPath);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'name' => 'Unit 301',
            'status' => 'ready',
            'description' => 'Kamar terang untuk dua tamu.',
            'price_per_night' => 700000,
            'capacity' => 2,
            'bed_count' => 1,
            'image_url' => 'https://example.com/room.jpg',
            'amenity_ids' => [],
            'is_active' => true,
        ];
    }
}
