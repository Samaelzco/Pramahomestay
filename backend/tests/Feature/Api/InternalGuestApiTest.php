<?php

namespace Tests\Feature\Api;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalGuestApiTest extends TestCase
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

    public function test_guest_endpoints_require_authentication_and_permission(): void
    {
        $this->getJson('/api/internal/guests')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/internal/guests')->assertForbidden();
    }

    public function test_authorized_user_can_create_filter_view_and_update_guest(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $created = $this->postJson('/api/internal/guests', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.full_name', 'Ayu Lestari')
            ->assertJsonPath('data.email', 'ayu@example.com');
        $id = $created->json('data.id');

        $this->getJson('/api/internal/guests?search=Ayu')
            ->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/internal/guests/{$id}")
            ->assertOk()->assertJsonPath('data.stats.bookings', 0);
        $this->putJson("/api/internal/guests/{$id}", [
            ...$this->payload(),
            'phone' => '+62 811 0000 1111',
        ])->assertOk()->assertJsonPath('data.phone', '+62 811 0000 1111');
    }

    public function test_guest_detail_returns_booking_and_payment_summary(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $guest = Guest::factory()->create();
        $booking = Booking::factory()->for($guest)->for(Room::factory())->create([
            'status' => BookingStatus::CheckedOut,
            'total_amount' => 1800000,
            'guest_name' => $guest->full_name,
            'guest_email' => $guest->email,
            'guest_phone' => $guest->phone,
        ]);
        Payment::factory()->for($booking)->create([
            'status' => PaymentStatus::Partial,
            'amount_paid' => 750000,
        ]);

        $this->getJson("/api/internal/guests/{$guest->id}")
            ->assertOk()
            ->assertJsonPath('data.stats.bookings', 1)
            ->assertJsonPath('data.stats.completed_stays', 1)
            ->assertJsonPath('data.stats.total_booking_value', '1800000.00')
            ->assertJsonPath('data.stats.total_paid', '750000.00')
            ->assertJsonCount(1, 'data.bookings');
    }

    public function test_guest_email_must_be_unique(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        Guest::factory()->create(['email' => 'ayu@example.com']);

        $this->postJson('/api/internal/guests', $this->payload())
            ->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    private function payload(): array
    {
        return [
            'full_name' => 'Ayu Lestari',
            'email' => 'ayu@example.com',
            'phone' => '+62 812 3456 7890',
            'address' => 'Denpasar, Bali',
            'notes' => 'Kontak melalui WhatsApp.',
        ];
    }
}
