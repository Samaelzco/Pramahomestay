<?php

namespace Tests\Feature\Api;

use App\Jobs\SendGuestEmail;
use App\Mail\GuestTransactionalMail;
use App\Models\EmailNotification;
use App\Models\HomestaySetting;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailNotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_booking_queues_bilingual_transactional_email_and_admin_can_monitor_it(): void
    {
        Queue::fake();
        $this->seed(AuthorizationSeeder::class);
        HomestaySetting::query()->create([
            'name' => 'Prama Homestay', 'address' => 'Bali', 'maps_url' => 'https://maps.example.test',
            'currency' => 'IDR', 'booking_code_prefix' => 'PRM', 'payment_code_prefix' => 'PAY',
            'mail_enabled' => true, 'mail_host' => 'smtp.example.test', 'mail_port' => 587,
            'mail_from_address' => 'booking@example.test', 'mail_from_name' => 'Prama Homestay', 'guest_email_locale' => 'en',
        ]);
        $room = Room::factory()->create(['is_active' => true, 'status' => 'ready', 'capacity' => 2]);

        $response = $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.11'])->postJson('/api/public/bookings', [
            'room_id' => $room->id, 'check_in' => now()->addDays(3)->toDateString(),
            'check_out' => now()->addDays(5)->toDateString(), 'guest_count' => 1,
            'full_name' => 'Ayu Lestari', 'email' => 'ayu@example.com', 'phone' => '6281234567890',
        ])->assertCreated();

        $notification = EmailNotification::query()->firstOrFail();
        $this->assertSame('booking_created', $notification->type->value);
        $this->assertSame('en', $notification->locale);
        $this->assertStringContainsString($response->json('data.payment_token'), $notification->action_url);
        $this->assertStringContainsString($notification->payload['booking_code'], (new GuestTransactionalMail($notification))->render());
        Queue::assertPushed(SendGuestEmail::class, fn (SendGuestEmail $job): bool => $job->notificationId === $notification->id);

        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);
        $this->getJson('/api/internal/email-notifications')->assertOk()
            ->assertJsonPath('data.0.recipient_email', 'ayu@example.com')
            ->assertJsonPath('data.0.status', 'queued')
            ->assertJsonMissingPath('data.0.action_url');
    }

    public function test_notification_history_requires_permission_and_disabled_mail_creates_no_queue_record(): void
    {
        Queue::fake();
        $this->getJson('/api/internal/email-notifications')->assertUnauthorized();
        HomestaySetting::query()->create([
            'name' => 'Prama Homestay', 'address' => 'Bali', 'maps_url' => 'https://maps.example.test',
            'currency' => 'IDR', 'booking_code_prefix' => 'PRM', 'payment_code_prefix' => 'PAY', 'mail_enabled' => false,
        ]);
        $room = Room::factory()->create(['is_active' => true, 'status' => 'ready', 'capacity' => 2]);
        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.2'])->postJson('/api/public/bookings', [
            'room_id' => $room->id, 'check_in' => now()->addDays(3)->toDateString(), 'check_out' => now()->addDays(4)->toDateString(),
            'guest_count' => 1, 'full_name' => 'Guest', 'email' => 'guest@example.com', 'phone' => '6281234567890',
        ])->assertCreated();
        $this->assertDatabaseCount('email_notifications', 0);
        Queue::assertNothingPushed();
    }

    public function test_payment_submission_and_verification_queue_guest_updates(): void
    {
        Queue::fake();
        Storage::fake('public');
        $this->seed(AuthorizationSeeder::class);
        HomestaySetting::query()->create([
            'name' => 'Prama Homestay', 'address' => 'Bali', 'maps_url' => 'https://maps.example.test',
            'currency' => 'IDR', 'booking_code_prefix' => 'PRM', 'payment_code_prefix' => 'PAY',
            'bank_name' => 'BCA', 'bank_account_number' => '123', 'bank_account_holder' => 'Prama',
            'mail_enabled' => true, 'mail_host' => 'smtp.example.test', 'mail_port' => 587,
            'mail_from_address' => 'booking@example.test', 'guest_email_locale' => 'id',
        ]);
        $room = Room::factory()->create(['is_active' => true, 'status' => 'ready', 'capacity' => 2]);
        $bookingResponse = $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.12'])->postJson('/api/public/bookings', [
            'room_id' => $room->id, 'check_in' => now()->addDays(3)->toDateString(), 'check_out' => now()->addDays(4)->toDateString(),
            'guest_count' => 1, 'full_name' => 'Guest', 'email' => 'guest@example.com', 'phone' => '6281234567890',
        ])->assertCreated();
        $token = $bookingResponse->json('data.payment_token');
        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.13'])->post("/api/public/payments/{$token}/proof", [
            'proof' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json'])->assertCreated();

        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);
        $paymentId = Payment::query()->value('id');
        $this->patchJson("/api/internal/payments/{$paymentId}/verify")->assertOk();

        $this->assertDatabaseHas('email_notifications', ['type' => 'payment_proof_submitted', 'status' => 'queued']);
        $this->assertDatabaseHas('email_notifications', ['type' => 'payment_verified', 'status' => 'queued']);
        $this->assertSame(3, EmailNotification::query()->count());
    }
}
