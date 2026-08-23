<?php

namespace Tests\Feature\Api;

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
