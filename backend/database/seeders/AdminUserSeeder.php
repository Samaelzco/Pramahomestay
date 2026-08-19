<?php

namespace Database\Seeders;

use App\Contracts\Services\UserServiceInterface;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminUserSeeder extends Seeder
{
    public function __construct(
        private readonly UserServiceInterface $users,
    ) {}

    public function run(): void
    {
        DB::transaction(function (): void {
            $email = (string) config('initial-admin.email');
            $attributes = [
                'name' => (string) config('initial-admin.name'),
                'email' => $email,
                'password' => (string) config('initial-admin.password'),
            ];

            $user = $this->users->findByEmail($email);
            $user = $user === null
                ? $this->users->create($attributes)
                : $this->users->update($user, $attributes);

            $role = Role::findOrCreate(
                (string) config('initial-admin.role'),
                (string) config('initial-admin.guard'),
            );

            $user->syncRoles([$role]);
        });
    }
}
