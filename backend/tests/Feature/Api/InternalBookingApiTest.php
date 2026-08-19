<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Guest;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalBookingApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Guest $guest;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AuthorizationSeeder::class);
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        $this->guest = Guest::factory()->create([
            'full_name' => 'Ayu Lestari',
            'email' => 'ayu@example.com',
            'phone' => '+62 812 3456 7890',
        ]);
    }

    public function test_booking_endpoints_require_authentication_and_permission(): void
    {
        $this->getJson('/api/internal/bookings')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/internal/bookings')->assertForbidden();
    }

    public function test_authorized_user_can_create_filter_view_and_update_booking(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $room = Room::factory()->create(['price_per_night' => 600000, 'capacity' => 3]);

        $created = $this->postJson('/api/internal/bookings', $this->payload($room))
            ->assertCreated()
            ->assertJsonPath('data.guest_name', 'Ayu Lestari')
            ->assertJsonPath('data.total_nights', 3)
            ->assertJsonPath('data.total_amount', '1800000.00');

        $id = $created->json('data.id');
        $this->assertStringStartsWith('PRM-', $created->json('data.booking_code'));

        $this->getJson('/api/internal/bookings?status=confirmed&search=Ayu')
            ->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/internal/bookings/{$id}")
            ->assertOk()->assertJsonPath('data.room.id', $room->id);

        $this->putJson("/api/internal/bookings/{$id}", [
            ...$this->payload($room),
            'status' => 'checked_in',
            'internal_notes' => 'Tamu tiba pukul 14.00.',
        ])->assertOk()->assertJsonPath('data.status', 'checked_in');
    }

    public function test_it_rejects_overlapping_dates_and_excess_guest_capacity(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $room = Room::factory()->create(['capacity' => 2]);
        Booking::factory()->for($room)->create([
            'check_in' => '2026-09-10',
            'check_out' => '2026-09-13',
            'status' => 'confirmed',
        ]);

        $this->postJson('/api/internal/bookings', [
            ...$this->payload($room),
            'check_in' => '2026-09-12',
            'check_out' => '2026-09-15',
        ])->assertUnprocessable()->assertJsonValidationErrors('check_in');

        $this->postJson('/api/internal/bookings', [
            ...$this->payload($room),
            'check_in' => '2026-09-15',
            'check_out' => '2026-09-17',
            'guest_count' => 3,
        ])->assertUnprocessable()->assertJsonValidationErrors('guest_count');
    }

    public function test_cancelled_booking_does_not_block_room_availability(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $room = Room::factory()->create(['capacity' => 2]);
        Booking::factory()->for($room)->create([
            'check_in' => '2026-09-10',
            'check_out' => '2026-09-13',
            'status' => 'cancelled',
        ]);

        $this->postJson('/api/internal/bookings', $this->payload($room))->assertCreated();
    }

    public function test_booking_can_be_cancelled_safely_before_check_in(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $booking = Booking::factory()->for(Room::factory())->for($this->guest)->create([
            'status' => 'confirmed',
            'internal_notes' => 'Catatan awal.',
        ]);

        $this->patchJson("/api/internal/bookings/{$booking->id}/cancel", ['reason' => 'Tamu mengubah rencana.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertStringContainsString('Alasan pembatalan: Tamu mengubah rencana.', $booking->refresh()->internal_notes);
    }

    public function test_booking_with_credited_payment_or_completed_stay_cannot_be_cancelled(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $paidBooking = Booking::factory()->for(Room::factory())->for($this->guest)->create(['status' => 'confirmed']);
        Payment::factory()->for($paidBooking)->create(['status' => 'partial', 'amount_paid' => 100000]);

        $this->patchJson("/api/internal/bookings/{$paidBooking->id}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->putJson("/api/internal/bookings/{$paidBooking->id}", [
            ...$this->payload($paidBooking->room),
            'status' => 'cancelled',
        ])->assertUnprocessable()->assertJsonValidationErrors('status');

        $checkedIn = Booking::factory()->for(Room::factory())->for($this->guest)->create(['status' => 'checked_in']);
        $this->patchJson("/api/internal/bookings/{$checkedIn->id}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $cancelled = Booking::factory()->for(Room::factory())->for($this->guest)->create(['status' => 'cancelled']);
        $this->putJson("/api/internal/bookings/{$cancelled->id}", [
            ...$this->payload($cancelled->room),
            'status' => 'confirmed',
        ])->assertUnprocessable()->assertJsonValidationErrors('status');
    }

    public function test_inactive_guest_cannot_be_assigned_to_a_new_booking(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $this->guest->update(['is_active' => false]);
        $room = Room::factory()->create();

        $this->postJson('/api/internal/bookings', $this->payload($room))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('guest_id');
    }

    public function test_pending_or_cancelled_booking_without_payment_can_be_soft_deleted(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $booking = Booking::factory()->for(Room::factory())->for($this->guest)->create(['status' => 'pending']);

        $this->getJson('/api/internal/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.can_delete', true);

        $this->deleteJson("/api/internal/bookings/{$booking->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Booking berhasil dihapus.');

        $this->assertSoftDeleted($booking);
    }

    public function test_confirmed_booking_or_booking_with_payment_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $confirmed = Booking::factory()->for(Room::factory())->for($this->guest)->create(['status' => 'confirmed']);
        $withPayment = Booking::factory()->for(Room::factory())->for($this->guest)->create(['status' => 'cancelled']);
        Payment::factory()->for($withPayment)->create(['status' => 'refunded']);

        $this->deleteJson("/api/internal/bookings/{$confirmed->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('delete');
        $this->deleteJson("/api/internal/bookings/{$withPayment->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('delete');

        $this->assertNotSoftDeleted($confirmed);
        $this->assertNotSoftDeleted($withPayment);
    }

    public function test_updating_booking_keeps_snapshot_when_guest_profile_is_unchanged(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $room = Room::factory()->create(['price_per_night' => 600000, 'capacity' => 3]);
        $created = $this->postJson('/api/internal/bookings', $this->payload($room))->assertCreated();
        $id = $created->json('data.id');

        $this->guest->update([
            'full_name' => 'Ayu Lestari Baru',
            'email' => 'ayu.baru@example.com',
            'phone' => '+62 811 0000 0000',
        ]);

        $this->putJson("/api/internal/bookings/{$id}", [
            ...$this->payload($room),
            'status' => 'checked_in',
        ])->assertOk()
            ->assertJsonPath('data.guest_name', 'Ayu Lestari')
            ->assertJsonPath('data.guest_email', 'ayu@example.com')
            ->assertJsonPath('data.guest_phone', '+62 812 3456 7890');
    }

    private function payload(Room $room): array
    {
        return [
            'room_id' => $room->id,
            'guest_id' => $this->guest->id,
            'check_in' => '2026-09-10',
            'check_out' => '2026-09-13',
            'guest_count' => 2,
            'status' => 'confirmed',
            'special_requests' => 'Kamar lantai atas.',
            'internal_notes' => null,
        ];
    }
}
