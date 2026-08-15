<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository implements UserRepositoryInterface
{
    public function __construct(private readonly User $model) {}

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->newQuery()
            ->latest()
            ->paginate($perPage);
    }

    public function findOrFail(int $id): User
    {
        return $this->model->newQuery()->findOrFail($id);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->model
            ->newQuery()
            ->where('email', $email)
            ->first();
    }

    public function create(array $attributes): User
    {
        return $this->model->newQuery()->create($attributes);
    }

    public function update(User $user, array $attributes): User
    {
        $user->updateOrFail($attributes);

        return $user->refresh();
    }

    public function delete(User $user): void
    {
        $user->deleteOrFail();
    }
}
