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

    public function test_guest_can_recover_booking_with_email_and_receives_a_rotated_private_token(): void
    {
        HomestaySetting::query()->create([
            'name' => 'Prama Homestay', 'address' => 'Bali', 'maps_url' => 'https://maps.example.test',
            'currency' => 'IDR', 'booking_code_prefix' => 'PRM', 'payment_code_prefix' => 'PAY',
        ]);
        $oldToken = str_repeat('a', 64);
        $booking = Booking::factory()->create([
            'booking_code' => 'PRM-2608-LOOKUP',
            'guest_email' => 'ayu@example.com',
            'guest_phone' => '6281234567890',
            'public_access_token_hash' => hash('sha256', $oldToken),
        ]);

        $response = $this->postJson('/api/public/bookings/recover', [
            'booking_code' => 'prm-2608-lookup',
            'contact' => 'AYU@example.com',
        ])->assertOk()->assertJsonPath('message', 'Pesanan berhasil ditemukan.');

        $newToken = $response->json('data.payment_token');
        $this->assertIsString($newToken);
        $this->assertSame(64, strlen($newToken));
        $this->assertNotSame($oldToken, $newToken);
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'public_access_token_hash' => hash('sha256', $newToken),
        ]);
        $this->getJson("/api/public/payments/{$oldToken}")->assertNotFound();
        $this->getJson("/api/public/payments/{$newToken}")->assertOk()
            ->assertJsonPath('data.booking.booking_code', 'PRM-2608-LOOKUP');
    }

    public function test_guest_can_recover_booking_with_a_normalized_phone_number(): void
    {
        $booking = Booking::factory()->create([
            'booking_code' => 'PRM-2608-PHONE',
            'guest_phone' => '+62 812-3456-7890',
        ]);

        $this->postJson('/api/public/bookings/recover', [
            'booking_code' => $booking->booking_code,
            'contact' => '6281234567890',
        ])->assertOk()->assertJsonStructure(['data' => ['payment_token']]);
    }

    public function test_public_booking_recovery_does_not_reveal_whether_code_or_contact_is_wrong(): void
    {
        $token = str_repeat('b', 64);
        $booking = Booking::factory()->create([
            'booking_code' => 'PRM-2608-PRIVATE',
            'guest_email' => 'guest@example.com',
            'public_access_token_hash' => hash('sha256', $token),
        ]);

        foreach ([
            ['booking_code' => $booking->booking_code, 'contact' => 'wrong@example.com'],
            ['booking_code' => 'PRM-2608-MISSING', 'contact' => 'guest@example.com'],
        ] as $payload) {
            $this->postJson('/api/public/bookings/recover', $payload)
                ->assertUnprocessable()
                ->assertJsonPath('errors.contact.0', 'Kode booking atau data kontak tidak cocok.');
        }

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'public_access_token_hash' => hash('sha256', $token),
        ]);
    }

    public function test_public_booking_recovery_is_rate_limited(): void
    {
        $payload = [
            'booking_code' => 'PRM-2608-THROTTLE',
            'contact' => 'guest@example.com',
        ];

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/public/bookings/recover', $payload)->assertUnprocessable();
        }

        $this->postJson('/api/public/bookings/recover', $payload)->assertTooManyRequests();
    }
}
