<?php

namespace App\Contracts\Services;

use App\Models\Role;
use Illuminate\Support\Collection;

interface AccessServiceInterface
{
    /** @return array<string, array{label: string, permissions: array<string, string>}> */
    public function catalogue(): array;

    /** @return Collection<int, Role> */
    public function roles(): Collection;

    /** @param array<int, string> $permissions */
    /** @param array<string, mixed> $attributes */
    public function createRole(array $attributes): Role;

    /** @param array<string, mixed> $attributes */
    public function updateRole(string $roleName, array $attributes): Role;

    public function deleteRole(string $roleName): void;
}
