<?php

namespace App\Contracts\Repositories;

use App\Models\Role;
use Illuminate\Support\Collection;

interface AccessRepositoryInterface
{
    /** @return Collection<int, Role> */
    public function roles(): Collection;

    public function findRoleOrFail(string $name): Role;

    /** @param array<string, mixed> $attributes */
    public function createRole(array $attributes): Role;

    /** @param array<string, mixed> $attributes */
    public function updateRole(Role $role, array $attributes): Role;

    /** @param array<int, string> $permissions */
    public function syncPermissions(Role $role, array $permissions): Role;

    public function roleHasUsers(int $roleId): bool;

    public function slugExists(string $slug): bool;

    public function deleteRole(Role $role): void;
}
