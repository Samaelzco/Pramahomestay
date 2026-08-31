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
            ->assertJsonPath('data.description_en', 'A bright room for two guests.')
            ->assertJsonPath('data.slug', 'unit-301');

        $roomId = $created->json('data.id');

        $this->getJson("/api/internal/rooms/{$roomId}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Unit 301');

        $this->getJson('/api/internal/rooms?search=bright')
            ->assertOk()
            ->assertJsonCount(1, 'data');

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

    public function test_authorized_user_can_upload_and_manage_multiple_room_images(): void
    {
        Storage::fake('public');
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);

        $payload = $this->payload();
        unset($payload['image_url']);
        $payload['images'] = [
            UploadedFile::fake()->image('unit-301-cover.jpg', 1200, 800)->size(500),
            UploadedFile::fake()->image('unit-301-bathroom.jpg', 1200, 800)->size(450),
        ];

        $created = $this->post('/api/internal/rooms', $payload, ['Accept' => 'application/json'])
            ->assertCreated();

        $room = Room::query()->findOrFail($created->json('data.id'));
        $firstImages = $room->images()->get();
        $this->assertCount(2, $firstImages);
        Storage::disk('public')->assertExists($firstImages[0]->path);
        Storage::disk('public')->assertExists($firstImages[1]->path);
        $created->assertJsonCount(2, 'data.images')
            ->assertJsonPath('data.images.0.is_cover', true)
            ->assertJsonPath('data.image_url', Storage::disk('public')->url($firstImages[0]->path));

        $replacementPayload = $this->payload();
        unset($replacementPayload['image_url']);
        $replacementPayload['_method'] = 'PUT';
        $replacementPayload['images'] = [UploadedFile::fake()->image('balcony.webp', 1200, 800)->size(600)];
        $replacementPayload['remove_image_ids'] = [$firstImages[0]->id];

        $updated = $this->post("/api/internal/rooms/{$room->id}", $replacementPayload, ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonCount(2, 'data.images')
            ->assertJsonPath('data.images.0.id', $firstImages[1]->id)
            ->assertJsonPath('data.images.0.is_cover', true);

        $room->refresh();
        $updatedImages = $room->images()->get();
        $this->assertCount(2, $updatedImages);
        Storage::disk('public')->assertMissing($firstImages[0]->path);
        Storage::disk('public')->assertExists($firstImages[1]->path);
        Storage::disk('public')->assertExists($updatedImages[1]->path);
        $updated->assertJsonPath('data.image_url', $firstImages[1]->url);

        $removePayload = $this->payload();
        unset($removePayload['image_url']);
        $removePayload['_method'] = 'PUT';
        $removePayload['remove_image_ids'] = $updatedImages->pluck('id')->all();

        $this->post("/api/internal/rooms/{$room->id}", $removePayload, ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.image_url', null);

        $room->refresh();
        $this->assertCount(0, $room->images()->get());
        Storage::disk('public')->assertMissing($firstImages[1]->path);
        Storage::disk('public')->assertMissing($updatedImages[1]->path);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'name' => 'Unit 301',
            'status' => 'ready',
            'description' => 'Kamar terang untuk dua tamu.',
            'description_en' => 'A bright room for two guests.',
            'price_per_night' => 700000,
            'capacity' => 2,
            'bed_count' => 1,
            'image_url' => 'https://example.com/room.jpg',
            'amenity_ids' => [],
            'is_active' => true,
        ];
    }
}
