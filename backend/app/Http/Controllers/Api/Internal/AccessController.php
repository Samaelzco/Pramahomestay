<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\AccessServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Access\StoreRoleRequest;
use App\Http\Requests\Access\UpdateRoleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AccessController extends Controller
{
    public function __construct(private readonly AccessServiceInterface $access) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('roles.view'), 403);

        return response()->json([
            'data' => [
                'groups' => collect($this->access->catalogue())->map(fn (array $group, string $key) => [
                    'key' => $key,
                    'label' => $group['label'],
                    'permissions' => collect($group['permissions'])->map(fn (string $label, string $name) => ['name' => $name, 'label' => $label])->values(),
                ])->values(),
                'roles' => $this->access->roles()->map(fn ($role) => [
                    'name' => $role->name,
                    'label' => $role->display_name ?? Str::headline($role->name),
                    'description' => $role->description,
                    'is_protected' => $role->is_protected,
                    'user_count' => $role->users_count,
                    'can_delete' => ! $role->is_protected && $role->users_count === 0,
                    'permissions' => $role->permissions->pluck('name')->values(),
                ])->values(),
            ],
        ]);
    }

    public function show(Request $request, string $role): JsonResponse
    {
        abort_unless($request->user()?->can('roles.view'), 403);
        $found = $this->access->roles()->firstWhere('name', $role);
        abort_if($found === null, 404);

        return response()->json(['data' => [
            'name' => $found->name,
            'label' => $found->display_name ?? Str::headline($found->name),
            'description' => $found->description,
            'is_protected' => $found->is_protected,
            'user_count' => $found->users_count,
            'can_delete' => ! $found->is_protected && $found->users_count === 0,
            'permissions' => $found->permissions->pluck('name')->values(),
        ]]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $created = $this->access->createRole($request->validated());

        return response()->json(['message' => 'Role berhasil ditambahkan.', 'data' => ['name' => $created->name]], 201);
    }

    public function update(UpdateRoleRequest $request, string $role): JsonResponse
    {
        $updated = $this->access->updateRole($role, $request->validated());

        return response()->json([
            'message' => 'Role dan hak akses berhasil diperbarui.',
            'data' => [
                'name' => $updated->name,
                'permissions' => $updated->permissions->pluck('name')->values(),
            ],
        ]);
    }

    public function destroy(Request $request, string $role): JsonResponse
    {
        abort_unless($request->user()?->can('roles.update'), 403);
        $this->access->deleteRole($role);

        return response()->json(['message' => 'Role berhasil dihapus.']);
    }
}
