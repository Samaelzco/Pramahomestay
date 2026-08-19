<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\AccessRepositoryInterface;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

class AccessRepository implements AccessRepositoryInterface
{
    public function roles(): Collection
    {
        return Role::query()->with('permissions:id,name')->orderBy('name')->get();
    }

    public function findRoleOrFail(string $name): Role
    {
        return Role::query()->where('guard_name', 'web')->where('name', $name)->firstOrFail();
    }

    public function syncPermissions(Role $role, array $permissions): Role
    {
        $role->syncPermissions($permissions);

        return $role->load('permissions:id,name');
    }
}
