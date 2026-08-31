<?php

namespace Tests\Feature\Api;

use App\Models\AuditLog;
use App\Models\HomestaySetting;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Database\Seeders\HomestaySettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalHomestaySettingApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([AuthorizationSeeder::class, HomestaySettingSeeder::class]);
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_settings_require_authentication_and_permission(): void
    {
        $this->getJson('/api/internal/settings')->assertUnauthorized();

        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Sanctum::actingAs($staff, ['internal']);

        $this->getJson('/api/internal/settings')->assertForbidden();
        $this->putJson('/api/internal/settings', $this->payload())->assertForbidden();
    }

    public function test_admin_can_view_and_update_settings_with_audit_log(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $this->getJson('/api/internal/settings')
            ->assertOk()
            ->assertJsonPath('data.address', 'Jl. Baja Taki III No.18, Dalung, Kec. Denpasar Bar., Kota Denpasar, Bali 80117')
            ->assertJsonPath('data.currency', 'IDR')
            ->assertJsonPath('data.timezone', 'Asia/Makassar')
            ->assertJsonPath('data.phone', null);

        $this->putJson('/api/internal/settings', [
            ...$this->payload(),
            'phone' => '+62 812 0000 0000',
            'check_in_time' => '14:00',
            'check_out_time' => '12:00',
        ])->assertOk()
            ->assertJsonPath('data.phone', '+62 812 0000 0000')
            ->assertJsonPath('data.check_in_time', '14:00');

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->admin->id,
            'module' => 'settings',
            'action' => 'updated',
            'subject_label' => 'Prama Homestay',
        ]);
    }

    public function test_settings_validation_rejects_unsupported_values(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $this->putJson('/api/internal/settings', [
            ...$this->payload(),
            'maps_url' => 'bukan-url',
            'timezone' => 'UTC',
            'currency' => 'USD',
            'booking_code_prefix' => 'kode booking',
        ])->assertUnprocessable()->assertJsonValidationErrors([
            'maps_url', 'timezone', 'currency', 'booking_code_prefix',
        ]);
    }

    public function test_smtp_password_is_encrypted_and_never_exposed_or_audited(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $secret = 'smtp-app-password-should-stay-secret';

        $response = $this->putJson('/api/internal/settings', [
            ...$this->payload(),
            'mail_enabled' => true,
            'mail_host' => 'smtp.example.com',
            'mail_port' => 587,
            'mail_username' => 'mailer@example.com',
            'mail_password' => $secret,
            'mail_encryption' => 'tls',
            'mail_from_address' => 'reservasi@example.com',
            'mail_from_name' => 'Prama Homestay',
            'guest_email_locale' => 'id',
        ])->assertOk()->assertJsonPath('data.mail_password_configured', true);

        $this->assertArrayNotHasKey('mail_password', $response->json('data'));

        $settings = HomestaySetting::query()->firstOrFail();
        $this->assertSame($secret, $settings->mail_password);
        $this->assertNotSame($secret, $settings->getRawOriginal('mail_password'));

        $auditLog = AuditLog::query()->where('module', 'settings')->latest('id')->firstOrFail();
        $this->assertArrayNotHasKey('mail_password', $auditLog->old_values ?? []);
        $this->assertArrayNotHasKey('mail_password', $auditLog->new_values ?? []);
        $this->assertStringNotContainsString($secret, $auditLog->toJson());
    }

    public function test_admin_can_upload_replace_and_remove_logo(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->admin, ['internal']);

        $firstPayload = $this->payload();
        $firstPayload['_method'] = 'PUT';
        $firstPayload['logo'] = UploadedFile::fake()->image('logo.png', 600, 600)->size(300);
        $this->post('/api/internal/settings', $firstPayload, ['Accept' => 'application/json'])->assertOk();
        $settings = HomestaySetting::query()->firstOrFail();
        $firstPath = $settings->logo_path;
        Storage::disk('public')->assertExists($firstPath);

        $replacementPayload = $this->payload();
        $replacementPayload['_method'] = 'PUT';
        $replacementPayload['logo'] = UploadedFile::fake()->image('logo-baru.webp', 600, 600)->size(300);
        $this->post('/api/internal/settings', $replacementPayload, ['Accept' => 'application/json'])->assertOk();
        $settings->refresh();
        $replacementPath = $settings->logo_path;
        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($replacementPath);

        $removePayload = $this->payload();
        $removePayload['_method'] = 'PUT';
        $removePayload['remove_logo'] = true;
        $this->post('/api/internal/settings', $removePayload, ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('data.logo_url', null);
        Storage::disk('public')->assertMissing($replacementPath);
    }

    public function test_admin_can_manage_image_carousel_and_single_hero_video(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->admin, ['internal']);

        $imagePayload = $this->payload();
        $imagePayload['_method'] = 'PUT';
        $imagePayload['hero_media_type'] = 'image';
        $imagePayload['hero_cycle_seconds'] = 4;
        $imagePayload['hero_images'] = [
            UploadedFile::fake()->image('hero-1.webp', 1600, 900)->size(500),
            UploadedFile::fake()->image('hero-2.webp', 1600, 900)->size(500),
        ];

        $imageResponse = $this->post('/api/internal/settings', $imagePayload, ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.hero_media_type', 'image')
            ->assertJsonPath('data.hero_cycle_seconds', 4)
            ->assertJsonCount(2, 'data.hero_images');

        $settings = HomestaySetting::query()->firstOrFail();
        foreach ($settings->hero_images as $image) {
            Storage::disk('public')->assertExists($image['path']);
        }

        $videoPayload = $this->payload();
        $videoPayload['_method'] = 'PUT';
        $videoPayload['hero_media_type'] = 'video';
        $videoPayload['hero_video'] = UploadedFile::fake()->create('hero.mp4', 1024, 'video/mp4');
        $this->post('/api/internal/settings', $videoPayload, ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.hero_media_type', 'video');

        $settings->refresh();
        Storage::disk('public')->assertExists($settings->hero_video_path);

        $removePayload = $this->payload();
        $removePayload['_method'] = 'PUT';
        $removePayload['hero_media_type'] = 'image';
        $removePayload['remove_hero_image_ids'] = [$imageResponse->json('data.hero_images.0.id')];
        $this->post('/api/internal/settings', $removePayload, ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonCount(1, 'data.hero_images');
    }

    public function test_video_mode_requires_a_video_and_image_carousel_is_limited_to_five_files(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->admin, ['internal']);

        $this->post('/api/internal/settings', [
            ...$this->payload(),
            '_method' => 'PUT',
            'hero_media_type' => 'video',
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('hero_video');

        $images = [];
        foreach (range(1, 6) as $index) {
            $images[] = UploadedFile::fake()->image("hero-{$index}.jpg", 1200, 800)->size(300);
        }
        $this->post('/api/internal/settings', [
            ...$this->payload(),
            '_method' => 'PUT',
            'hero_media_type' => 'image',
            'hero_images' => $images,
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('hero_images');
    }

    public function test_admin_can_upload_replace_and_remove_final_cta_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->admin, ['internal']);

        $uploadPayload = $this->payload();
        $uploadPayload['_method'] = 'PUT';
        $uploadPayload['final_cta_image'] = UploadedFile::fake()->image('cta.webp', 1600, 900)->size(500);
        $this->post('/api/internal/settings', $uploadPayload, ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.final_cta_image_url', fn (?string $url): bool => str_contains((string) $url, 'settings/final-cta/'));

        $settings = HomestaySetting::query()->firstOrFail();
        $storedPath = $settings->final_cta_image_path;
        Storage::disk('public')->assertExists($storedPath);

        $removePayload = $this->payload();
        $removePayload['_method'] = 'PUT';
        $removePayload['remove_final_cta_image'] = true;
        $this->post('/api/internal/settings', $removePayload, ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.final_cta_image_url', null);
        Storage::disk('public')->assertMissing($storedPath);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'name' => 'Prama Homestay',
            'address' => 'Jl. Baja Taki III No.18, Dalung, Kec. Denpasar Bar., Kota Denpasar, Bali 80117',
            'maps_url' => 'https://maps.app.goo.gl/Nfsfk4UYLfo3zuEB8',
            'phone' => null,
            'email' => null,
            'check_in_time' => null,
            'check_out_time' => null,
            'timezone' => 'Asia/Makassar',
            'currency' => 'IDR',
            'bank_name' => null,
            'bank_account_number' => null,
            'bank_account_holder' => null,
            'qris_notes' => null,
            'booking_code_prefix' => 'PRM',
            'payment_code_prefix' => 'PAY',
            'cancellation_policy' => null,
            'payment_instructions' => null,
        ];
    }
}
