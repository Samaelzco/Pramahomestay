<?php

namespace App\Contracts\Repositories;

use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

interface AccessRepositoryInterface
{
    /** @return Collection<int, Role> */
    public function roles(): Collection;

    public function findRoleOrFail(string $name): Role;

    /** @param array<int, string> $permissions */
    public function syncPermissions(Role $role, array $permissions): Role;
}
