<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Guest;
use App\Models\HomestaySetting;
use App\Models\Payment;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

        $response = $this->postJson('/api/public/bookings', [
            'room_id' => $room->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guest_count' => 2,
            'full_name' => 'Made Pranata',
            'email' => 'MADE@example.com',
            'phone' => '6281234567890',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.total_nights', 3)
            ->assertJsonPath('data.total_amount', '1950000.00')
            ->assertJsonStructure(['data' => ['payment_token', 'payment_due_at']]);

        $this->assertDatabaseHas('guests', ['email' => 'made@example.com', 'full_name' => 'Made Pranata']);
        $this->assertDatabaseHas('bookings', ['room_id' => $room->id, 'status' => 'pending', 'guest_count' => 2]);
        $this->assertSame(64, strlen($response->json('data.payment_token')));
        $this->assertDatabaseHas('bookings', ['public_access_token_hash' => hash('sha256', $response->json('data.payment_token'))]);
    }

    public function test_guest_can_open_payment_link_and_submit_proof_without_login(): void
    {
        Storage::fake('public');
        HomestaySetting::query()->create([
            'name' => 'Prama Homestay', 'address' => 'Bali', 'maps_url' => 'https://maps.example.test',
            'currency' => 'IDR', 'booking_code_prefix' => 'PRM', 'payment_code_prefix' => 'PAY',
            'bank_name' => 'BCA', 'bank_account_number' => '1234567890', 'bank_account_holder' => 'Prama Homestay',
        ]);
        $room = Room::factory()->create(['status' => 'ready', 'is_active' => true, 'capacity' => 2, 'price_per_night' => 650000]);

        $bookingResponse = $this->postJson('/api/public/bookings', [
            'room_id' => $room->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(7)->toDateString(),
            'guest_count' => 2,
            'full_name' => 'Ayu Lestari',
            'email' => 'ayu@example.com',
            'phone' => '6281234567890',
        ])->assertCreated();
        $token = $bookingResponse->json('data.payment_token');

        $this->getJson("/api/public/payments/{$token}")
            ->assertOk()
            ->assertJsonPath('data.property.bank_name', 'BCA')
            ->assertJsonPath('data.booking.total_amount', '1300000.00')
            ->assertJsonPath('data.payment', null);

        $this->post("/api/public/payments/{$token}/proof", [
            'reference_number' => 'TRX-001',
            'proof' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.payment.status', 'pending_verification');

        $payment = Payment::query()->firstOrFail();
        $this->assertSame('pending_verification', $payment->status->value);
        $this->assertSame('bank_transfer', $payment->method->value);
        Storage::disk('public')->assertExists($payment->proof_path);
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
            'guest_count' => 2, 'full_name' => 'Guest Updated', 'email' => 'guest@example.com', 'phone' => '6281111111',
        ];
        $this->postJson('/api/public/bookings', $payload)->assertUnprocessable()->assertJsonValidationErrors('check_in');
        $this->postJson('/api/public/bookings', [...$payload, 'check_in' => now()->addDays(8)->toDateString(), 'check_out' => now()->addDays(9)->toDateString(), 'guest_count' => 3])
            ->assertUnprocessable()->assertJsonValidationErrors('guest_count');
        $this->assertSame(1, Guest::query()->where('email', 'guest@example.com')->count());
    }
}
