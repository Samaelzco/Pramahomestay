<?php

namespace Tests\Feature\Api;

use App\Contracts\Services\InternalNotificationServiceInterface;
use App\Enums\BookingStatus;
use App\Events\InternalNotificationCreated;
use App\Models\Booking;
use App\Models\EmailNotification;
use App\Models\HomestaySetting;
use App\Models\InternalNotification;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalNotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_notifications_require_authentication(): void
    {
        $this->postJson('/api/broadcasting/auth', [
            'socket_id' => '123.456',
            'channel_name' => 'private-internal-users.1',
        ])->assertUnauthorized();
        $this->getJson('/api/internal/notifications')->assertUnauthorized();
        $this->getJson('/api/internal/notifications/summary')->assertUnauthorized();
        $this->postJson('/api/internal/notifications/read-all')->assertUnauthorized();
        $this->postJson('/api/internal/notifications/1/read')->assertUnauthorized();
    }

    public function test_user_can_only_authorize_their_own_private_realtime_channel(): void
    {
        config()->set('broadcasting.default', 'reverb');
        config()->set('broadcasting.connections.reverb', [
            'driver' => 'reverb',
            'key' => 'test-key',
            'secret' => 'test-secret',
            'app_id' => 'test-app',
            'options' => ['host' => 'localhost', 'port' => 8080, 'scheme' => 'http', 'useTLS' => false],
        ]);
        Broadcast::forgetDrivers();
        require base_path('routes/channels.php');
        $user = User::factory()->create(['is_active' => true]);
        $other = User::factory()->create(['is_active' => true]);
        Sanctum::actingAs($user, ['internal']);

        $this->postJson('/api/broadcasting/auth', [
            'socket_id' => '123.456',
            'channel_name' => "private-internal-users.{$user->id}",
        ])->assertOk()->assertJsonStructure(['auth']);

        $this->postJson('/api/broadcasting/auth', [
            'socket_id' => '123.456',
            'channel_name' => "private-internal-users.{$other->id}",
        ])->assertForbidden();
    }

    public function test_realtime_event_targets_the_notification_owner_with_public_payload(): void
    {
        $notification = $this->notification(User::factory()->create(), 'booking:9:created');
        $event = new InternalNotificationCreated($notification);

        $this->assertSame("private-internal-users.{$notification->user_id}", $event->broadcastOn()->name);
        $this->assertSame('internal.notification.created', $event->broadcastAs());
        $this->assertSame($notification->id, $event->broadcastWith()['notification']['id']);
        $this->assertArrayNotHasKey('user_id', $event->broadcastWith()['notification']);
    }

    public function test_user_can_list_and_mark_only_their_own_notifications_as_read(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $notification = $this->notification($user, 'booking:1:created');
        $otherNotification = $this->notification($other, 'booking:2:created');
        Sanctum::actingAs($user, ['internal']);

        $this->getJson('/api/internal/notifications/summary')->assertOk()
            ->assertJsonPath('data.unread_count', 1)
            ->assertJsonPath('data.notifications.0.id', $notification->id);
        $this->getJson('/api/internal/notifications')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $notification->id);

        $this->postJson("/api/internal/notifications/{$notification->id}/read")->assertOk()
            ->assertJsonPath('data.is_read', true);
        $this->postJson("/api/internal/notifications/{$otherNotification->id}/read")->assertNotFound();
        $this->assertDatabaseHas('internal_notifications', ['id' => $otherNotification->id, 'read_at' => null]);
    }

    public function test_mark_all_read_only_updates_authenticated_users_notifications(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->notification($user, 'booking:1:created');
        $this->notification($user, 'booking:2:created');
        $otherNotification = $this->notification($other, 'booking:3:created');
        Sanctum::actingAs($user, ['internal']);

        $this->postJson('/api/internal/notifications/read-all')->assertOk()->assertJsonPath('updated', 2);
        $this->assertSame(0, InternalNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count());
        $this->assertDatabaseHas('internal_notifications', ['id' => $otherNotification->id, 'read_at' => null]);
    }

    public function test_daily_reminders_are_created_once_for_staff_with_operational_permission(): void
    {
        Queue::fake();
        $this->seed(AuthorizationSeeder::class);
        $this->travelTo(now()->setDate(2026, 8, 30)->setTime(8, 0));
        $this->settings()->update([
            'mail_enabled' => true,
            'mail_host' => 'smtp.example.test',
            'mail_port' => 587,
            'mail_from_address' => 'booking@example.test',
        ]);
        $staff = User::factory()->create(['receives_internal_email_notifications' => true]);
        $staff->assignRole('staff');
        $room = Room::factory()->create(['name' => 'Unit 101', 'status' => 'ready']);
        Booking::factory()->create([
            'room_id' => $room->id,
            'status' => BookingStatus::Confirmed,
            'check_in' => '2026-08-30',
            'check_out' => '2026-08-31',
        ]);
        Booking::factory()->create([
            'room_id' => $room->id,
            'status' => BookingStatus::CheckedIn,
            'check_in' => '2026-08-29',
            'check_out' => '2026-08-30',
        ]);

        $service = app(InternalNotificationServiceInterface::class);
        $this->assertSame(2, $service->queueDailyReminders());
        $this->assertSame(0, $service->queueDailyReminders());
        $this->assertDatabaseCount('internal_notifications', 2);
        $this->assertDatabaseHas('internal_notifications', ['user_id' => $staff->id, 'type' => 'check_in_due']);
        $this->assertDatabaseHas('internal_notifications', ['user_id' => $staff->id, 'type' => 'check_out_due']);
        $this->assertSame(2, EmailNotification::query()->where('recipient_scope', 'internal')->count());
    }

    public function test_public_booking_and_payment_proof_create_notifications_for_operational_staff(): void
    {
        Storage::fake('public');
        $this->seed(AuthorizationSeeder::class);
        $this->settings()->update([
            'bank_name' => 'BCA',
            'bank_account_number' => '123456789',
            'bank_account_holder' => 'Prama Homestay',
        ]);
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        $room = Room::factory()->create(['is_active' => true, 'status' => 'ready', 'capacity' => 2]);

        $booking = $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.41'])->postJson('/api/public/bookings', [
            'room_id' => $room->id,
            'check_in' => now()->addDays(3)->toDateString(),
            'check_out' => now()->addDays(5)->toDateString(),
            'guest_count' => 1,
            'full_name' => 'Ayu Lestari',
            'email' => 'ayu@example.com',
            'phone' => '6281234567890',
        ])->assertCreated();

        $this->assertDatabaseHas('internal_notifications', ['user_id' => $staff->id, 'type' => 'booking_created']);
        $token = $booking->json('data.payment_token');
        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.42'])->post("/api/public/payments/{$token}/proof", [
            'proof' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json'])->assertCreated();
        $this->assertDatabaseHas('internal_notifications', ['user_id' => $staff->id, 'type' => 'payment_proof_submitted']);
    }

    private function notification(User $user, string $eventKey): InternalNotification
    {
        return InternalNotification::query()->create([
            'user_id' => $user->id,
            'event_key' => $eventKey,
            'type' => 'booking_created',
            'title' => 'Booking baru masuk',
            'title_en' => 'New booking received',
            'message' => 'Booking baru perlu diperiksa.',
            'message_en' => 'A new booking needs review.',
            'action_url' => '/internal/bookings/1',
        ]);
    }

    private function settings(): HomestaySetting
    {
        return HomestaySetting::query()->create([
            'name' => 'Prama Homestay',
            'address' => 'Bali',
            'maps_url' => 'https://maps.example.test',
            'currency' => 'IDR',
            'timezone' => 'Asia/Makassar',
            'booking_code_prefix' => 'PRM',
            'payment_code_prefix' => 'PAY',
        ]);
    }
}
