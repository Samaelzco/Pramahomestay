<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalOperationApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(now()->setDate(2026, 9, 10)->setTime(2, 0));
        $this->seed(AuthorizationSeeder::class);
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    protected function tearDown(): void
    {
        $this->travelBack();
        parent::tearDown();
    }

    public function test_operations_require_authentication_and_permission(): void
    {
        $this->getJson('/api/internal/operations')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/internal/operations')->assertForbidden();
    }

    public function test_daily_operations_return_arrivals_departures_and_housekeeping(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $arrival = Booking::factory()->for(Room::factory()->state(['status' => 'ready']))->create([
            'check_in' => '2026-09-10', 'check_out' => '2026-09-12', 'status' => 'confirmed',
        ]);
        Payment::factory()->for($arrival)->create(['status' => 'paid', 'amount_paid' => $arrival->total_amount]);
        Booking::factory()->for(Room::factory()->state(['status' => 'occupied']))->create([
            'check_in' => '2026-09-08', 'check_out' => '2026-09-10', 'status' => 'checked_in',
        ]);
        Room::factory()->create(['name' => 'Unit Bersih', 'status' => 'cleaning']);

        $this->getJson('/api/internal/operations?date=2026-09-10')
            ->assertOk()
            ->assertJsonPath('data.today', '2026-09-10')
            ->assertJsonPath('data.summary.arrivals_due', 1)
            ->assertJsonPath('data.summary.departures_due', 1)
            ->assertJsonPath('data.summary.cleaning_rooms', 1)
            ->assertJsonPath('data.arrivals.0.can_check_in', true)
            ->assertJsonPath('data.arrivals.0.payment.status', 'paid')
            ->assertJsonCount(1, 'data.departures')
            ->assertJsonCount(1, 'data.housekeeping');
    }

    public function test_paid_confirmed_booking_can_check_in_then_check_out_and_room_can_be_ready(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $room = Room::factory()->create(['status' => 'ready', 'is_active' => true]);
        $booking = Booking::factory()->for($room)->create([
            'check_in' => '2026-09-10', 'check_out' => '2026-09-12', 'status' => 'confirmed',
        ]);
        Payment::factory()->for($booking)->create(['status' => 'paid', 'amount_paid' => $booking->total_amount]);

        $this->patchJson("/api/internal/operations/bookings/{$booking->id}/check-in", ['note' => 'Tamu menerima satu kunci.'])
            ->assertOk();
        $booking->refresh();
        $this->assertSame('checked_in', $booking->status->value);
        $this->assertSame($this->admin->id, $booking->checked_in_by);
        $this->assertNotNull($booking->checked_in_at);
        $this->assertStringContainsString('Catatan check-in: Tamu menerima satu kunci.', $booking->internal_notes);
        $this->assertSame('occupied', $room->refresh()->status->value);

        $this->patchJson("/api/internal/operations/bookings/{$booking->id}/check-out", ['note' => 'Handuk perlu diganti.'])
            ->assertOk();
        $booking->refresh();
        $this->assertSame('checked_out', $booking->status->value);
        $this->assertSame($this->admin->id, $booking->checked_out_by);
        $this->assertNotNull($booking->checked_out_at);
        $this->assertStringContainsString('Catatan check-out: Handuk perlu diganti.', $booking->internal_notes);
        $this->assertSame('cleaning', $room->refresh()->status->value);

        $this->patchJson("/api/internal/operations/rooms/{$room->id}/ready")
            ->assertOk();
        $this->assertSame('ready', $room->refresh()->status->value);
    }

    public function test_unpaid_or_future_booking_cannot_check_in(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $unpaid = Booking::factory()->for(Room::factory()->state(['status' => 'ready']))->create([
            'check_in' => '2026-09-10', 'check_out' => '2026-09-12', 'status' => 'confirmed',
        ]);
        Payment::factory()->for($unpaid)->create(['status' => 'pending_verification']);

        $this->patchJson("/api/internal/operations/bookings/{$unpaid->id}/check-in")
            ->assertUnprocessable()->assertJsonValidationErrors('payment');

        $future = Booking::factory()->for(Room::factory()->state(['status' => 'ready']))->create([
            'check_in' => '2026-09-11', 'check_out' => '2026-09-12', 'status' => 'confirmed',
        ]);
        Payment::factory()->for($future)->create(['status' => 'paid', 'amount_paid' => $future->total_amount]);

        $this->patchJson("/api/internal/operations/bookings/{$future->id}/check-in")
            ->assertUnprocessable()->assertJsonValidationErrors('status');
    }

    public function test_invalid_checkout_and_housekeeping_transitions_are_rejected(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $booking = Booking::factory()->for(Room::factory()->state(['status' => 'ready']))->create(['status' => 'confirmed']);

        $this->patchJson("/api/internal/operations/bookings/{$booking->id}/check-out")
            ->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->patchJson("/api/internal/operations/rooms/{$booking->room_id}/ready")
            ->assertUnprocessable()->assertJsonValidationErrors('status');
    }
}
