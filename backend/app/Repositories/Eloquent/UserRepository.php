<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class UserRepository implements UserRepositoryInterface
{
    public function __construct(private readonly User $model) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->newQuery()
            ->with('roles:id,name')
            ->withCount(['createdBookings', 'createdGuests', 'createdPayments'])
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $term = '%'.mb_strtolower($search).'%';
                $query->where(function ($query) use ($term): void {
                    $query->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
                });
            })
            ->when($filters['role'] ?? null, fn ($query, string $role) => $query->role($role))
            ->when(array_key_exists('is_active', $filters), fn ($query) => $query->where('is_active', $filters['is_active']))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findOrFail(int $id): User
    {
        return $this->model->newQuery()->with('roles:id,name')->findOrFail($id);
    }

    public function findForUpdate(int $id): User
    {
        return $this->model->newQuery()->lockForUpdate()->findOrFail($id);
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

    public function hasOperationalRelations(int $userId): bool
    {
        $user = $this->model->newQuery()->findOrFail($userId);

        return $user->createdBookings()->withTrashed()->exists()
            || $user->createdGuests()->withTrashed()->exists()
            || $user->createdPayments()->withTrashed()->exists();
    }

    public function countActiveAdmins(): int
    {
        return $this->model->newQuery()->where('is_active', true)->role('admin')->count();
    }

    public function internalEmailRecipients(string $permission): Collection
    {
        return $this->model->newQuery()
            ->where('is_active', true)
            ->where('receives_internal_email_notifications', true)
            ->where(function ($query) use ($permission): void {
                $query->whereHas('roles.permissions', fn ($query) => $query->where('name', $permission))
                    ->orWhereHas('permissions', fn ($query) => $query->where('name', $permission));
            })
            ->get();
    }
}
