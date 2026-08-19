<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\AccessServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Access\UpdateRolePermissionsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
                    'label' => $role->name === 'admin' ? 'Administrator' : 'Staff',
                    'is_protected' => $role->name === 'admin',
                    'permissions' => $role->permissions->pluck('name')->values(),
                ])->values(),
            ],
        ]);
    }

    public function update(UpdateRolePermissionsRequest $request, string $role): JsonResponse
    {
        $updated = $this->access->updateRolePermissions($role, $request->validated('permissions'));

        return response()->json([
            'message' => 'Hak akses staff berhasil diperbarui.',
            'data' => [
                'name' => $updated->name,
                'permissions' => $updated->permissions->pluck('name')->values(),
            ],
        ]);
    }
}
