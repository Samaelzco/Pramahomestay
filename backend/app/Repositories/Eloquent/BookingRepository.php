<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BookingRepository implements BookingRepositoryInterface
{
    public function __construct(private readonly Booking $model) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->with(['room', 'guest'])
            ->withExists(['payment as any_payment_exists' => fn ($query) => $query->withTrashed()])
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $term = '%'.mb_strtolower($search).'%';
                $query->where(function ($query) use ($term): void {
                    $query->whereRaw('LOWER(booking_code) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(guest_name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(guest_email) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(guest_phone) LIKE ?', [$term]);
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['room_id'] ?? null, fn ($query, int $roomId) => $query->where('room_id', $roomId))
            ->when($filters['without_payment'] ?? false, fn ($query) => $query->whereDoesntHave('payment'))
            ->when($filters['date_from'] ?? null, fn ($query, string $date) => $query->whereDate('check_out', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, string $date) => $query->whereDate('check_in', '<=', $date))
            ->orderByDesc('check_in')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $attributes): Booking
    {
        return $this->model->newQuery()->create($attributes)->load(['room', 'guest']);
    }

    public function update(Booking $booking, array $attributes): Booking
    {
        $booking->updateOrFail($attributes);

        return $booking->refresh()->load(['room', 'guest']);
    }

    public function delete(Booking $booking): void
    {
        $booking->deleteOrFail();
    }

    public function findForUpdate(int $id): Booking
    {
        return $this->model->newQuery()->lockForUpdate()->findOrFail($id);
    }

    public function hasDateConflict(int $roomId, string $checkIn, string $checkOut, ?int $ignoreId = null): bool
    {
        return $this->model->newQuery()
            ->where('room_id', $roomId)
            ->where('status', '!=', BookingStatus::Cancelled->value)
            ->whereDate('check_in', '<', $checkOut)
            ->whereDate('check_out', '>', $checkIn)
            ->when($ignoreId, fn ($query, int $id) => $query->whereKeyNot($id))
            ->exists();
    }

    public function codeExists(string $code): bool
    {
        return $this->model->newQuery()->where('booking_code', $code)->exists();
    }
}
