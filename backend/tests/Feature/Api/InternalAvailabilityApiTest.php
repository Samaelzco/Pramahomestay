<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Guest;
use App\Models\Room;
use App\Models\RoomBlock;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalAvailabilityApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AuthorizationSeeder::class);
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_calendar_requires_authentication_and_booking_permission(): void
    {
        $this->getJson('/api/internal/availability')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/internal/availability')->assertForbidden();
    }

    public function test_calendar_returns_bookings_blocks_and_occupancy_summary(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $room = Room::factory()->create(['name' => 'Unit 101', 'is_active' => true]);
        Booking::factory()->for($room)->create([
            'guest_name' => 'Ayu Lestari',
            'check_in' => '2026-09-02',
            'check_out' => '2026-09-04',
            'status' => 'confirmed',
        ]);
        RoomBlock::factory()->for($room)->create([
            'title' => 'Perawatan AC',
            'start_date' => '2026-09-05',
            'end_date' => '2026-09-06',
        ]);

        $this->getJson('/api/internal/availability?view=week&start=2026-09-01')
            ->assertOk()
            ->assertJsonPath('data.period.days', 7)
            ->assertJsonPath('data.summary.occupied_room_days', 2)
            ->assertJsonPath('data.summary.blocked_room_days', 1)
            ->assertJsonPath('data.rooms.0.entries.0.type', 'booking')
            ->assertJsonPath('data.rooms.0.entries.1.type', 'block');
    }

    public function test_admin_can_create_and_delete_non_overlapping_room_block(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $room = Room::factory()->create();

        $created = $this->postJson('/api/internal/availability/blocks', [
            'room_id' => $room->id,
            'title' => 'Perbaikan kamar mandi',
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-12',
            'notes' => 'Vendor datang pagi.',
        ])->assertCreated();

        $id = $created->json('data.id');
        $this->assertDatabaseHas('room_blocks', ['id' => $id, 'created_by' => $this->admin->id]);
        $this->deleteJson("/api/internal/availability/blocks/{$id}")->assertOk();
        $this->assertDatabaseMissing('room_blocks', ['id' => $id]);
    }

    public function test_block_cannot_overlap_booking_or_another_block(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $room = Room::factory()->create();
        Booking::factory()->for($room)->create([
            'check_in' => '2026-09-10',
            'check_out' => '2026-09-13',
            'status' => 'confirmed',
        ]);

        $this->postJson('/api/internal/availability/blocks', [
            'room_id' => $room->id,
            'title' => 'Perawatan',
            'start_date' => '2026-09-12',
            'end_date' => '2026-09-14',
        ])->assertUnprocessable()->assertJsonValidationErrors('start_date');

        RoomBlock::factory()->for($room)->create([
            'start_date' => '2026-09-15',
            'end_date' => '2026-09-17',
        ]);
        $this->postJson('/api/internal/availability/blocks', [
            'room_id' => $room->id,
            'title' => 'Pemakaian internal',
            'start_date' => '2026-09-16',
            'end_date' => '2026-09-18',
        ])->assertUnprocessable()->assertJsonValidationErrors('start_date');
    }

    public function test_blocked_room_is_not_publicly_available_and_cannot_be_booked(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $room = Room::factory()->create(['capacity' => 2, 'is_active' => true, 'status' => 'ready']);
        RoomBlock::factory()->for($room)->create([
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-13',
        ]);

        $this->getJson('/api/public/landing?check_in=2026-09-11&check_out=2026-09-12&guests=1')
            ->assertOk()
            ->assertJsonMissing(['id' => $room->id]);

        $this->postJson('/api/internal/bookings', [
            'room_id' => $room->id,
            'guest_id' => Guest::factory()->create()->id,
            'check_in' => '2026-09-11',
            'check_out' => '2026-09-12',
            'guest_count' => 1,
            'status' => 'confirmed',
        ])->assertUnprocessable()->assertJsonValidationErrors('check_in');
    }
}
