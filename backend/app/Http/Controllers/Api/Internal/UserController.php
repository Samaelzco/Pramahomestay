<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\UserServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\IndexUserRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserActivationRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function __construct(private readonly UserServiceInterface $users) {}

    public function index(IndexUserRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);
        unset($validated['per_page'], $validated['page']);

        return UserResource::collection($this->users->paginate($validated, $perPage));
    }

    public function store(StoreUserRequest $request): UserResource
    {
        $attributes = $request->validated();
        $role = (string) $attributes['role'];
        unset($attributes['role']);
        $user = $this->users->create($attributes, $role);

        return (new UserResource($user))->additional(['message' => 'User berhasil ditambahkan.']);
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user->load('roles:id,name'));
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $attributes = $request->validated();
        $role = (string) $attributes['role'];
        unset($attributes['role']);
        if (blank($attributes['password'] ?? null)) {
            unset($attributes['password']);
        }
        $user = $this->users->update($user, $attributes, $role, $request->user());

        return (new UserResource($user))->additional(['message' => 'User berhasil diperbarui.']);
    }

    public function activation(UpdateUserActivationRequest $request, User $user): UserResource
    {
        $user = $this->users->setActive($user, (bool) $request->validated('is_active'), $request->user());

        return (new UserResource($user))->additional([
            'message' => $user->is_active ? 'User berhasil diaktifkan.' : 'User berhasil dinonaktifkan.',
        ]);
    }

    public function destroy(User $user, Request $request): JsonResponse
    {
        $this->users->delete($user, $request->user());

        return response()->json(['message' => 'User berhasil dihapus.']);
    }
}
