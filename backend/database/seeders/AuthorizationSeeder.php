<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AuthorizationSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        DB::transaction(function (): void {
            $permissions = collect([
                'rooms.view',
                'rooms.create',
                'rooms.update',
                'bookings.view',
                'bookings.create',
                'bookings.update',
                'payments.view',
                'payments.create',
                'payments.update',
            ])->map(fn (string $name): Permission => Permission::findOrCreate($name, 'web'));

            Role::findOrCreate('admin', 'web')->syncPermissions($permissions);
            Role::findOrCreate('staff', 'web')->syncPermissions($permissions);
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
