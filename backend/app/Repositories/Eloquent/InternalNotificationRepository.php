<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\InternalNotificationRepositoryInterface;
use App\Models\InternalNotification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class InternalNotificationRepository implements InternalNotificationRepositoryInterface
{
    public function __construct(private readonly InternalNotification $model) {}

    public function paginateForUser(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->where('user_id', $user->id)
            ->when($filters['status'] ?? null, function ($query, string $status): void {
                $status === 'unread' ? $query->whereNull('read_at') : $query->whereNotNull('read_at');
            })
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('type', $type))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function latestForUser(User $user, int $limit = 5): Collection
    {
        return $this->model->newQuery()
            ->where('user_id', $user->id)
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function unreadCountForUser(User $user): int
    {
        return $this->model->newQuery()->where('user_id', $user->id)->whereNull('read_at')->count();
    }

    public function createForPermission(string $permission, array $attributes): int
    {
        $created = 0;
        User::query()
            ->where('is_active', true)
            ->where(function ($query) use ($permission): void {
                $query->whereHas('roles.permissions', fn ($query) => $query->where('name', $permission))
                    ->orWhereHas('permissions', fn ($query) => $query->where('name', $permission));
            })
            ->each(function (User $user) use ($attributes, &$created): void {
                $notification = $this->model->newQuery()->firstOrCreate(
                    ['user_id' => $user->id, 'event_key' => $attributes['event_key']],
                    [...$attributes, 'user_id' => $user->id],
                );
                $created += $notification->wasRecentlyCreated ? 1 : 0;
            });

        return $created;
    }

    public function findForUser(User $user, int $id): InternalNotification
    {
        return $this->model->newQuery()->where('user_id', $user->id)->findOrFail($id);
    }

    public function markRead(InternalNotification $notification): InternalNotification
    {
        if ($notification->read_at === null) {
            $notification->updateOrFail(['read_at' => now()]);
        }

        return $notification->refresh();
    }

    public function markAllRead(User $user): int
    {
        return $this->model->newQuery()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now(), 'updated_at' => now()]);
    }
}
