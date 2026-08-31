<?php

namespace App\Services;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\UserServiceInterface;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserService implements UserServiceInterface
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly AuditLogger $auditLogger,
    ) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->users->paginate($filters, $perPage);
    }

    public function findOrFail(int $id): User
    {
        return $this->users->findOrFail($id);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->users->findByEmail($email);
    }

    public function create(array $attributes, ?string $role = null): User
    {
        return DB::transaction(function () use ($attributes, $role): User {
            $user = $this->users->create($attributes);
            if ($role !== null) {
                $user->syncRoles([$role]);
            }

            $user = $user->load('roles:id,name');
            $this->auditLogger->record($user, 'created', [], [
                ...$user->getAttributes(),
                'role' => $role,
            ]);

            return $user;
        });
    }

    public function update(User $user, array $attributes, ?string $role = null, ?User $actor = null): User
    {
        return DB::transaction(function () use ($user, $attributes, $role, $actor): User {
            $locked = $this->users->findForUpdate($user->id);
            $oldValues = collect(array_keys($attributes))
                ->mapWithKeys(fn (string $key): array => [$key => $locked->getRawOriginal($key)])
                ->all();
            $oldValues['role'] = $locked->getRoleNames()->first();
            if ($actor?->is($locked) && $role !== null && ! $locked->hasRole($role)) {
                throw ValidationException::withMessages(['role' => 'Role akun yang sedang digunakan tidak dapat diubah sendiri.']);
            }

            $updated = $this->users->update($locked, $attributes);
            if ($role !== null) {
                $updated->syncRoles([$role]);
            }

            $updated = $updated->load('roles:id,name');
            $newValues = collect(array_keys($attributes))
                ->mapWithKeys(fn (string $key): array => [$key => $updated->getRawOriginal($key)])
                ->all();
            $newValues['role'] = $updated->getRoleNames()->first();
            if (array_key_exists('password', $attributes)) {
                unset($oldValues['password'], $newValues['password']);
                $oldValues['password_changed'] = false;
                $newValues['password_changed'] = true;
            }
            $changed = collect(array_keys($newValues))
                ->filter(fn (string $key): bool => json_encode($oldValues[$key] ?? null) !== json_encode($newValues[$key] ?? null))
                ->values();
            $this->auditLogger->record(
                $updated,
                'updated',
                $changed->mapWithKeys(fn (string $key): array => [$key => $oldValues[$key] ?? null])->all(),
                $changed->mapWithKeys(fn (string $key): array => [$key => $newValues[$key] ?? null])->all(),
            );

            return $updated;
        });
    }

    public function setActive(User $user, bool $isActive, User $actor): User
    {
        return DB::transaction(function () use ($user, $isActive, $actor): User {
            $locked = $this->users->findForUpdate($user->id);
            if ($actor->is($locked)) {
                throw ValidationException::withMessages(['is_active' => 'Akun yang sedang digunakan tidak dapat dinonaktifkan.']);
            }
            $this->guardLastAdmin($locked, $isActive);
            $updated = $this->users->update($locked, ['is_active' => $isActive]);
            if (! $isActive) {
                $updated->tokens()->delete();
            }

            $this->auditLogger->record(
                $updated,
                $isActive ? 'activated' : 'deactivated',
                ['is_active' => ! $isActive],
                ['is_active' => $isActive],
            );

            return $updated->load('roles:id,name');
        });
    }

    public function recordLogin(User $user): User
    {
        return $this->users->update($user, ['last_login_at' => now()]);
    }

    public function delete(User $user, ?User $actor = null): void
    {
        DB::transaction(function () use ($user, $actor): void {
            $locked = $this->users->findForUpdate($user->id);
            if ($actor?->is($locked)) {
                throw ValidationException::withMessages(['delete' => 'Akun yang sedang digunakan tidak dapat dihapus.']);
            }
            $this->guardLastAdmin($locked, false);
            if ($this->users->hasOperationalRelations($locked->id)) {
                throw ValidationException::withMessages(['delete' => 'User tidak dapat dihapus karena memiliki riwayat operasional. Nonaktifkan akun sebagai gantinya.']);
            }
            $locked->tokens()->delete();
            $this->auditLogger->record($locked, 'deleted', [
                ...$locked->getAttributes(),
                'role' => $locked->getRoleNames()->first(),
            ]);
            $this->users->delete($locked);
        });
    }

    private function guardLastAdmin(User $user, bool $willBeActive): void
    {
        if (! $willBeActive && $user->is_active && $user->hasRole('admin') && $this->users->countActiveAdmins() <= 1) {
            throw ValidationException::withMessages(['is_active' => 'Admin aktif terakhir tidak dapat dinonaktifkan atau dihapus.']);
        }
    }
}
