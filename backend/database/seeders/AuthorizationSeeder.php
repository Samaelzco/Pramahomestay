<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class AuthorizationSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        DB::transaction(function (): void {
            $operationalPermissions = collect([
                'dashboard.view',
                'reports.view',
                'reports.export',
                'guests.view',
                'guests.create',
                'guests.update',
                'rooms.view',
                'rooms.create',
                'rooms.update',
                'amenities.view',
                'amenities.create',
                'amenities.update',
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
                'audit_logs.view',
                'settings.view',
                'settings.update',
            ])->map(fn (string $name): Permission => Permission::findOrCreate($name, 'web'));

            $admin = Role::findOrCreate('admin', 'web');
            $admin->update(['display_name' => 'Administrator', 'description' => 'Akses penuh ke seluruh fitur internal dan pengaturan sistem.', 'is_protected' => true]);
            $admin->syncPermissions($operationalPermissions->concat($administrativePermissions));

            $staff = Role::findOrCreate('staff', 'web');
            $staff->update(['display_name' => 'Staff', 'description' => 'Akses operasional harian sesuai permission yang dipilih.', 'is_protected' => false]);
            $staff->syncPermissions($operationalPermissions);
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
