<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalAuditLogApiTest extends TestCase
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

    public function test_audit_log_requires_authentication_and_permission(): void
    {
        $this->getJson('/api/internal/audit-logs')->assertUnauthorized();

        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Sanctum::actingAs($staff, ['internal']);

        $this->getJson('/api/internal/audit-logs')->assertForbidden();
    }

    public function test_model_changes_are_recorded_and_can_be_filtered_and_viewed(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $created = $this->postJson('/api/internal/rooms', $this->roomPayload())
            ->assertCreated();
        $roomId = $created->json('data.id');

        $this->putJson("/api/internal/rooms/{$roomId}", [
            ...$this->roomPayload(),
            'name' => 'Unit Audit 402',
        ])->assertOk();

        $response = $this->getJson('/api/internal/audit-logs?module=rooms&action=updated&search=Audit')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.actor.id', $this->admin->id)
            ->assertJsonPath('data.0.module', 'rooms')
            ->assertJsonPath('data.0.action', 'updated')
            ->assertJsonPath('data.0.old_values.name', 'Unit Audit 401')
            ->assertJsonPath('data.0.new_values.name', 'Unit Audit 402');

        $logId = $response->json('data.0.id');
        $this->getJson("/api/internal/audit-logs/{$logId}")
            ->assertOk()
            ->assertJsonPath('data.subject_id', $roomId)
            ->assertJsonPath('data.subject_label', 'Unit Audit 402');
    }

    public function test_activation_and_role_changes_receive_meaningful_actions(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $room = $this->postJson('/api/internal/rooms', $this->roomPayload())->json('data');
        $this->patchJson("/api/internal/rooms/{$room['id']}/activation", ['is_active' => false])->assertOk();
        $this->postJson('/api/internal/access/roles', [
            'display_name' => 'Auditor',
            'description' => 'Membaca aktivitas sistem.',
            'permissions' => ['audit_logs.view'],
        ])->assertCreated();

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'rooms',
            'action' => 'deactivated',
            'subject_id' => $room['id'],
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'module' => 'roles',
            'action' => 'created',
            'subject_label' => 'Auditor',
        ]);
    }

    public function test_user_role_and_password_changes_are_audited_without_secret_values(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $this->postJson('/api/internal/access/roles', [
            'display_name' => 'Auditor',
            'description' => 'Membaca aktivitas sistem.',
            'permissions' => ['audit_logs.view'],
        ])->assertCreated();
        $created = $this->postJson('/api/internal/users', [
            'name' => 'Putu Audit',
            'email' => 'putu.audit@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'staff',
            'is_active' => true,
        ])->assertCreated();
        $userId = $created->json('data.id');

        $this->putJson("/api/internal/users/{$userId}", [
            'name' => 'Putu Audit',
            'email' => 'putu.audit@example.com',
            'password' => 'password456',
            'password_confirmation' => 'password456',
            'role' => 'auditor',
        ])->assertOk();

        $response = $this->getJson('/api/internal/audit-logs?module=users&action=updated&search=Putu')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.old_values.role', 'staff')
            ->assertJsonPath('data.0.new_values.role', 'auditor')
            ->assertJsonPath('data.0.new_values.password_changed', true);

        $this->assertArrayNotHasKey('password', $response->json('data.0.old_values'));
        $this->assertArrayNotHasKey('password', $response->json('data.0.new_values'));
    }

    /** @return array<string, mixed> */
    private function roomPayload(): array
    {
        return [
            'name' => 'Unit Audit 401',
            'type' => 'studio',
            'status' => 'ready',
            'description' => 'Kamar pengujian audit.',
            'price_per_night' => 700000,
            'capacity' => 2,
            'bed_count' => 1,
            'image_url' => null,
            'amenity_ids' => [],
            'is_active' => true,
        ];
    }
}
