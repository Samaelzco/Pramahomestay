<?php

namespace App\Services;

use App\Contracts\Repositories\AccessRepositoryInterface;
use App\Contracts\Services\AccessServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AccessService implements AccessServiceInterface
{
    public function __construct(private readonly AccessRepositoryInterface $access) {}

    public function catalogue(): array
    {
        return [
            'dashboard' => ['label' => 'Ringkasan', 'permissions' => ['dashboard.view' => 'Lihat dashboard']],
            'rooms' => ['label' => 'Kamar', 'permissions' => ['rooms.view' => 'Lihat kamar', 'rooms.create' => 'Tambah kamar', 'rooms.update' => 'Ubah kamar']],
            'bookings' => ['label' => 'Booking', 'permissions' => ['bookings.view' => 'Lihat booking', 'bookings.create' => 'Tambah booking', 'bookings.update' => 'Ubah booking']],
            'payments' => ['label' => 'Pembayaran', 'permissions' => ['payments.view' => 'Lihat pembayaran', 'payments.create' => 'Tambah pembayaran', 'payments.update' => 'Ubah pembayaran']],
            'guests' => ['label' => 'Tamu', 'permissions' => ['guests.view' => 'Lihat tamu', 'guests.create' => 'Tambah tamu', 'guests.update' => 'Ubah tamu']],
        ];
    }

    public function roles(): Collection
    {
        return $this->access->roles();
    }

    public function updateRolePermissions(string $roleName, array $permissions): Role
    {
        if ($roleName === 'admin') {
            throw ValidationException::withMessages(['permissions' => 'Hak akses admin dilindungi dan selalu mencakup seluruh fitur.']);
        }

        $allowed = collect($this->catalogue())->flatMap(fn (array $group) => array_keys($group['permissions']));
        $permissions = collect($permissions)->unique()->filter(fn (string $permission) => $allowed->contains($permission))->values()->all();
        if (! collect($permissions)->contains(fn (string $permission) => str_ends_with($permission, '.view'))) {
            throw ValidationException::withMessages(['permissions' => 'Pilih setidaknya satu izin melihat agar staff tetap memiliki area kerja.']);
        }

        return DB::transaction(fn (): Role => $this->access->syncPermissions(
            $this->access->findRoleOrFail($roleName),
            $permissions,
        ));
    }
}
