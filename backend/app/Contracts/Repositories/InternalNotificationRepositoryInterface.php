<?php

namespace App\Contracts\Repositories;

use App\Models\InternalNotification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface InternalNotificationRepositoryInterface
{
    public function paginateForUser(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /** @return Collection<int, InternalNotification> */
    public function latestForUser(User $user, int $limit = 5): Collection;

    public function unreadCountForUser(User $user): int;

    public function createForPermission(string $permission, array $attributes): int;

    public function findForUser(User $user, int $id): InternalNotification;

    public function markRead(InternalNotification $notification): InternalNotification;

    public function markAllRead(User $user): int;
}
