<?php

namespace App\Contracts\Repositories;

use App\Models\EmailNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EmailNotificationRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function createOnce(array $attributes): ?EmailNotification;

    public function find(int $id): EmailNotification;

    public function update(EmailNotification $notification, array $attributes): EmailNotification;
}
