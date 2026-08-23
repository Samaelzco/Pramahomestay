<?php

namespace App\Services;

use App\Contracts\Repositories\AccessRepositoryInterface;
use App\Contracts\Services\AccessServiceInterface;
use App\Models\Role;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AccessService implements AccessServiceInterface
{
    public function __construct(
        private readonly AccessRepositoryInterface $access,
        private readonly AuditLogger $auditLogger,
    ) {}

    public function catalogue(): array
    {
        return [
            'dashboard' => ['label' => 'Ringkasan', 'permissions' => ['dashboard.view' => 'Lihat dashboard']],
            'reports' => ['label' => 'Laporan', 'permissions' => ['reports.view' => 'Lihat laporan', 'reports.export' => 'Ekspor laporan']],
            'rooms' => ['label' => 'Kamar', 'permissions' => ['rooms.view' => 'Lihat kamar', 'rooms.create' => 'Tambah kamar', 'rooms.update' => 'Ubah kamar']],
            'amenities' => ['label' => 'Fasilitas', 'permissions' => ['amenities.view' => 'Lihat fasilitas', 'amenities.create' => 'Tambah fasilitas', 'amenities.update' => 'Ubah fasilitas']],
            'bookings' => ['label' => 'Booking', 'permissions' => ['bookings.view' => 'Lihat booking', 'bookings.create' => 'Tambah booking', 'bookings.update' => 'Ubah booking']],
            'payments' => ['label' => 'Pembayaran', 'permissions' => ['payments.view' => 'Lihat pembayaran', 'payments.create' => 'Tambah pembayaran', 'payments.update' => 'Ubah pembayaran']],
            'guests' => ['label' => 'Tamu', 'permissions' => ['guests.view' => 'Lihat tamu', 'guests.create' => 'Tambah tamu', 'guests.update' => 'Ubah tamu']],
            'audit_logs' => ['label' => 'Audit Log', 'permissions' => ['audit_logs.view' => 'Lihat riwayat aktivitas']],
            'settings' => ['label' => 'Pengaturan', 'permissions' => ['settings.view' => 'Lihat pengaturan', 'settings.update' => 'Ubah pengaturan']],
        ];
    }

    public function roles(): Collection
    {
        return $this->access->roles();
    }

    public function createRole(array $attributes): Role
    {
        return DB::transaction(function () use ($attributes): Role {
            $permissions = $this->validatedPermissions($attributes['permissions'] ?? []);
            unset($attributes['permissions']);
            $attributes['name'] = $this->uniqueSlug((string) $attributes['display_name']);
            $attributes['guard_name'] = 'web';
            $attributes['is_protected'] = false;
            $role = $this->access->createRole($attributes);

            $role = $this->access->syncPermissions($role, $permissions);
            $this->auditLogger->record($role, 'created', [], [
                'display_name' => $role->display_name,
                'description' => $role->description,
                'permissions' => $permissions,
            ]);

            return $role;
        });
    }

    public function updateRole(string $roleName, array $attributes): Role
    {
        return DB::transaction(function () use ($roleName, $attributes): Role {
            $role = $this->access->findRoleOrFail($roleName);
            $this->guardProtected($role);
            $oldValues = [
                'display_name' => $role->display_name,
                'description' => $role->description,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ];
            $permissions = $this->validatedPermissions($attributes['permissions'] ?? []);
            unset($attributes['permissions']);
            $role = $this->access->updateRole($role, $attributes);

            $role = $this->access->syncPermissions($role, $permissions);
            $this->auditLogger->record($role, 'updated', $oldValues, [
                'display_name' => $role->display_name,
                'description' => $role->description,
                'permissions' => $permissions,
            ]);

            return $role;
        });
    }

    public function deleteRole(string $roleName): void
    {
        DB::transaction(function () use ($roleName): void {
            $role = $this->access->findRoleOrFail($roleName);
            $this->guardProtected($role);
            if ($this->access->roleHasUsers($role->id)) {
                throw ValidationException::withMessages(['delete' => 'Role tidak dapat dihapus karena masih digunakan oleh user. Pindahkan role user terlebih dahulu.']);
            }

            $this->auditLogger->record($role, 'deleted', [
                'display_name' => $role->display_name,
                'description' => $role->description,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ]);
            $this->access->deleteRole($role);
        });
    }

    /** @param array<int, string> $permissions
     * @return array<int, string>
     */
    private function validatedPermissions(array $permissions): array
    {
        $allowed = collect($this->catalogue())->flatMap(fn (array $group) => array_keys($group['permissions']));
        $permissions = collect($permissions)->unique()->filter(fn (string $permission) => $allowed->contains($permission))->values()->all();
        if (! collect($permissions)->contains(fn (string $permission) => str_ends_with($permission, '.view'))) {
            throw ValidationException::withMessages(['permissions' => 'Pilih setidaknya satu izin melihat agar role tetap memiliki area kerja.']);
        }

        return $permissions;
    }

    private function guardProtected(Role $role): void
    {
        if ($role->is_protected) {
            throw ValidationException::withMessages(['role' => 'Role sistem yang dilindungi tidak dapat diubah atau dihapus.']);
        }
    }

    private function uniqueSlug(string $displayName): string
    {
        $base = Str::slug($displayName);
        if ($base === '') {
            throw ValidationException::withMessages(['display_name' => 'Nama role harus mengandung setidaknya satu huruf atau angka.']);
        }
        $slug = $base;
        $suffix = 2;
        while ($this->access->slugExists($slug)) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
