<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class InternalAuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_and_logout_with_an_api_token(): void
    {
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create(['password' => Hash::make('password')]);
        $admin->assignRole('admin');

        $response = $this->postJson('/api/auth/login', [
            'email' => $admin->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('user.email', $admin->email)
            ->assertJsonPath('user.roles.0', 'admin');

        $token = $response->json('token');
        $this->assertNotEmpty($token);

        $this->withToken($token)
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_invalid_credentials_do_not_create_a_token(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
