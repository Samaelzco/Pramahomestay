<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\AccessRepositoryInterface;
use App\Models\Role;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AccessRepository implements AccessRepositoryInterface
{
    public function roles(): Collection
    {
        $roles = Role::query()->with('permissions:id,name')->orderByDesc('is_protected')->orderBy('display_name')->get();
        $counts = DB::table('model_has_roles')->selectRaw('role_id, COUNT(*) as aggregate')->groupBy('role_id')->pluck('aggregate', 'role_id');

        return $roles->each(fn (Role $role) => $role->setAttribute('users_count', (int) ($counts[$role->id] ?? 0)));
    }

    public function findRoleOrFail(string $name): Role
    {
        return Role::query()->where('guard_name', 'web')->where('name', $name)->firstOrFail();
    }

    public function createRole(array $attributes): Role
    {
        return Role::query()->create($attributes)->load('permissions:id,name');
    }

    public function updateRole(Role $role, array $attributes): Role
    {
        $role->updateOrFail($attributes);

        return $role->refresh()->load('permissions:id,name');
    }

    public function syncPermissions(Role $role, array $permissions): Role
    {
        $role->syncPermissions($permissions);

        return $role->load('permissions:id,name');
    }

    public function roleHasUsers(int $roleId): bool
    {
        return DB::table('model_has_roles')->where('role_id', $roleId)->exists();
    }

    public function slugExists(string $slug): bool
    {
        return Role::query()->where('guard_name', 'web')->where('name', $slug)->exists();
    }

    public function deleteRole(Role $role): void
    {
        $role->deleteOrFail();
    }
}
