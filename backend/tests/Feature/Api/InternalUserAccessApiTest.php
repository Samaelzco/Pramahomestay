<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalUserAccessApiTest extends TestCase
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

    public function test_user_management_requires_authentication_and_admin_permission(): void
    {
        $this->getJson('/api/internal/users')->assertUnauthorized();

        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Sanctum::actingAs($staff, ['internal']);
        $this->getJson('/api/internal/users')->assertForbidden();
        $this->getJson('/api/internal/access/roles')->assertForbidden();
    }

    public function test_admin_can_create_filter_view_and_update_user(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $created = $this->postJson('/api/internal/users', [
            'name' => 'Made Staff',
            'email' => 'made@prama.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'staff',
            'is_active' => true,
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Made Staff')
            ->assertJsonPath('data.roles.0', 'staff');

        $id = $created->json('data.id');
        $this->getJson('/api/internal/users?search=Made&role=staff&is_active=1')
            ->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/internal/users/{$id}")
            ->assertOk()->assertJsonPath('data.email', 'made@prama.test');
        $this->putJson("/api/internal/users/{$id}", [
            'name' => 'Made Supervisor',
            'email' => 'made@prama.test',
            'password' => '',
            'password_confirmation' => '',
            'role' => 'staff',
        ])->assertOk()->assertJsonPath('data.name', 'Made Supervisor');

        $this->assertTrue(Hash::check('password123', User::findOrFail($id)->password));
    }

    public function test_admin_can_deactivate_user_and_inactive_user_cannot_login(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $staff = User::factory()->create(['password' => Hash::make('password123')]);
        $staff->assignRole('staff');
        $staff->createToken('internal-dashboard');

        $this->patchJson("/api/internal/users/{$staff->id}/activation", ['is_active' => false])
            ->assertOk()->assertJsonPath('data.is_active', false);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $staff->id]);

        $this->postJson('/api/auth/login', ['email' => $staff->email, 'password' => 'password123'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_admin_cannot_deactivate_or_delete_their_own_account(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $this->patchJson("/api/internal/users/{$this->admin->id}/activation", ['is_active' => false])
            ->assertUnprocessable()->assertJsonValidationErrors('is_active');
        $this->deleteJson("/api/internal/users/{$this->admin->id}")
            ->assertUnprocessable()->assertJsonValidationErrors('delete');
    }

    public function test_user_without_relations_can_be_deleted_but_operational_user_cannot(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $unused = User::factory()->create();
        $unused->assignRole('staff');
        $operator = User::factory()->create();
        $operator->assignRole('staff');
        Booking::factory()->for(Room::factory())->create(['created_by' => $operator->id]);

        $this->deleteJson("/api/internal/users/{$unused->id}")->assertOk();
        $this->assertSoftDeleted($unused);
        $this->deleteJson("/api/internal/users/{$operator->id}")
            ->assertUnprocessable()->assertJsonValidationErrors('delete');
    }

    public function test_admin_role_is_protected_and_staff_permissions_can_be_updated(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $this->getJson('/api/internal/access/roles')
            ->assertOk()
            ->assertJsonPath('data.roles.0.is_protected', true);

        $this->patchJson('/api/internal/access/roles/staff', [
            'display_name' => 'Staff',
            'description' => 'Operasional terbatas.',
            'permissions' => ['dashboard.view', 'rooms.view'],
        ])->assertOk()->assertJsonPath('data.permissions.1', 'rooms.view');

        $staff = User::factory()->create();
        $staff->assignRole('staff');
        $this->assertTrue($staff->fresh()->can('rooms.view'));
        $this->assertFalse($staff->fresh()->can('rooms.create'));

        $this->patchJson('/api/internal/access/roles/admin', [
            'display_name' => 'Administrator',
            'description' => 'Akses penuh.',
            'permissions' => ['dashboard.view'],
        ])->assertUnprocessable()->assertJsonValidationErrors('role');
    }

    public function test_admin_can_create_update_assign_and_delete_custom_role(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $created = $this->postJson('/api/internal/access/roles', [
            'display_name' => 'Resepsionis',
            'description' => 'Mengelola tamu dan booking.',
            'permissions' => ['bookings.view', 'bookings.create', 'guests.view'],
        ])->assertCreated();
        $roleName = $created->json('data.name');
        $this->assertSame('resepsionis', $roleName);

        $this->getJson("/api/internal/access/roles/{$roleName}")
            ->assertOk()->assertJsonPath('data.label', 'Resepsionis');
        $this->putJson("/api/internal/access/roles/{$roleName}", [
            'display_name' => 'Front Office',
            'description' => 'Menangani reservasi dan tamu.',
            'permissions' => ['bookings.view', 'guests.view'],
        ])->assertOk();

        $user = User::factory()->create();
        $user->assignRole($roleName);
        $this->deleteJson("/api/internal/access/roles/{$roleName}")
            ->assertUnprocessable()->assertJsonValidationErrors('delete');

        $user->syncRoles(['staff']);
        $this->deleteJson("/api/internal/access/roles/{$roleName}")->assertOk();
        $this->assertDatabaseMissing('roles', ['name' => $roleName]);
    }

    public function test_user_with_custom_role_can_login(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $created = $this->postJson('/api/internal/access/roles', [
            'display_name' => 'Kasir',
            'description' => null,
            'permissions' => ['payments.view'],
        ])->assertCreated();
        $user = User::factory()->create(['password' => Hash::make('password123')]);
        $user->assignRole($created->json('data.name'));

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password123'])
            ->assertOk()->assertJsonPath('user.roles.0', 'kasir');
    }
}
