<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\EmailNotificationRepositoryInterface;
use App\Models\EmailNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EmailNotificationRepository implements EmailNotificationRepositoryInterface
{
    public function __construct(private readonly EmailNotification $model) {}

    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->model->newQuery()->with(['booking:id,booking_code', 'payment:id,payment_code', 'user:id,name,email'])
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $term = '%'.mb_strtolower($search).'%';
                $query->where(fn ($query) => $query->whereRaw('LOWER(recipient_name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(recipient_email) LIKE ?', [$term])
                    ->orWhereHas('booking', fn ($query) => $query->whereRaw('LOWER(booking_code) LIKE ?', [$term])));
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('type', $type))
            ->latest()->paginate($perPage)->withQueryString();
    }

    public function createOnce(array $attributes): ?EmailNotification
    {
        if ($this->model->newQuery()->where('event_key', $attributes['event_key'])->exists()) {
            return null;
        }

        return $this->model->newQuery()->create($attributes);
    }

    public function find(int $id): EmailNotification
    {
        return $this->model->newQuery()->with(['booking:id,booking_code', 'payment:id,payment_code', 'user:id,name,email'])->findOrFail($id);
    }

    public function update(EmailNotification $notification, array $attributes): EmailNotification
    {
        $notification->updateOrFail($attributes);

        return $notification->refresh();
    }
}
