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
            $operationalPermissions = collect([
                'dashboard.view',
                'guests.view',
                'guests.create',
                'guests.update',
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

            $administrativePermissions = collect([
                'users.view',
                'users.create',
                'users.update',
                'roles.view',
                'roles.update',
            ])->map(fn (string $name): Permission => Permission::findOrCreate($name, 'web'));

            Role::findOrCreate('admin', 'web')->syncPermissions($operationalPermissions->concat($administrativePermissions));
            Role::findOrCreate('staff', 'web')->syncPermissions($operationalPermissions);
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
