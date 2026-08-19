<?php

namespace App\Contracts\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserServiceInterface
{
    /**
     * @return LengthAwarePaginator<int, User>
     */
    /** @param array{search?: string, role?: string, is_active?: bool} $filters */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function findOrFail(int $id): User;

    public function findByEmail(string $email): ?User;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes, ?string $role = null): User;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(User $user, array $attributes, ?string $role = null, ?User $actor = null): User;

    public function setActive(User $user, bool $isActive, User $actor): User;

    public function recordLogin(User $user): User;

    public function delete(User $user, ?User $actor = null): void;
}
