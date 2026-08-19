<?php

namespace App\Contracts\Services;

use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

interface AccessServiceInterface
{
    /** @return array<string, array{label: string, permissions: array<string, string>}> */
    public function catalogue(): array;

    /** @return Collection<int, Role> */
    public function roles(): Collection;

    /** @param array<int, string> $permissions */
    public function updateRolePermissions(string $roleName, array $permissions): Role;
}
