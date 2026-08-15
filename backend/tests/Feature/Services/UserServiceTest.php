<?php

namespace Tests\Feature\Services;

use App\Contracts\Services\UserServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_manages_users_through_the_service_and_repository_layers(): void
    {
        $service = $this->app->make(UserServiceInterface::class);

        $user = $service->create([
            'name' => 'Prama Admin',
            'email' => 'prama@example.com',
            'password' => 'secret-password',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'prama@example.com',
        ]);
        $this->assertTrue(Hash::check('secret-password', $user->password));
        $this->assertTrue($service->findByEmail('prama@example.com')?->is($user));
        $this->assertTrue($service->findOrFail($user->id)->is($user));
        $this->assertCount(1, $service->paginate());

        $updatedUser = $service->update($user, [
            'name' => 'Prama Manager',
        ]);

        $this->assertSame('Prama Manager', $updatedUser->name);

        $service->delete($updatedUser);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
}
