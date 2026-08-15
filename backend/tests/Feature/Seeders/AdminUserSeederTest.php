<?php

namespace Tests\Feature\Seeders;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_the_admin_user_with_a_hashed_password_and_admin_role(): void
    {
        $this->seed(AdminUserSeeder::class);

        $admin = User::query()
            ->where('email', 'admin@gmail.com')
            ->firstOrFail();

        $this->assertSame('Prama Administrator', $admin->name);
        $this->assertTrue(Hash::check('password', $admin->password));
        $this->assertTrue($admin->hasRole('admin'));
    }

    public function test_it_is_idempotent_when_run_multiple_times(): void
    {
        $this->seed(AdminUserSeeder::class);
        $this->seed(AdminUserSeeder::class);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('roles', 1);
        $this->assertDatabaseCount('model_has_roles', 1);
    }
}
