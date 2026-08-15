<?php

namespace App\Services;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\UserServiceInterface;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class UserService implements UserServiceInterface
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
    ) {}

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->users->paginate($perPage);
    }

    public function findOrFail(int $id): User
    {
        return $this->users->findOrFail($id);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->users->findByEmail($email);
    }

    public function create(array $attributes): User
    {
        return DB::transaction(
            fn (): User => $this->users->create($attributes),
        );
    }

    public function update(User $user, array $attributes): User
    {
        return DB::transaction(
            fn (): User => $this->users->update($user, $attributes),
        );
    }

    public function delete(User $user): void
    {
        DB::transaction(function () use ($user): void {
            $this->users->delete($user);
        });
    }
}
