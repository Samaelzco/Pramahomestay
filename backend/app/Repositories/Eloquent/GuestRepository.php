<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Models\Guest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class GuestRepository implements GuestRepositoryInterface
{
    public function __construct(private readonly Guest $model) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->summaryQuery()
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $term = '%'.mb_strtolower($search).'%';
                $query->where(function (Builder $query) use ($term): void {
                    $query->whereRaw('LOWER(full_name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(phone) LIKE ?', [$term]);
                });
            })
            ->when(array_key_exists('is_active', $filters), fn (Builder $query) => $query->where('is_active', $filters['is_active']))
            ->orderByDesc('latest_check_in')
            ->orderBy('full_name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $attributes): Guest
    {
        return $this->model->newQuery()->create($attributes);
    }

    public function update(Guest $guest, array $attributes): Guest
    {
        $guest->updateOrFail($attributes);

        return $guest->refresh();
    }

    public function delete(Guest $guest): void
    {
        $guest->deleteOrFail();
    }

    public function hasAnyBooking(int $guestId): bool
    {
        return $this->model->newQuery()->findOrFail($guestId)->bookings()->withTrashed()->exists();
    }

    public function findForUpdate(int $id): Guest
    {
        return $this->model->newQuery()->lockForUpdate()->findOrFail($id);
    }

    public function findByEmailForUpdate(string $email): ?Guest
    {
        return $this->model->newQuery()->whereRaw('LOWER(email) = ?', [mb_strtolower($email)])->lockForUpdate()->first();
    }

    public function withDetails(Guest $guest): Guest
    {
        return $this->summaryQuery()
            ->with(['bookings' => fn ($query) => $query->with(['room', 'payment'])->latest('check_in')->limit(20)])
            ->findOrFail($guest->id);
    }

    private function summaryQuery(): Builder
    {
        return $this->model->newQuery()
            ->withCount(['bookings as all_bookings_count' => fn (Builder $query) => $query->withTrashed()])
            ->withCount('bookings')
            ->withCount(['bookings as completed_stays_count' => fn (Builder $query) => $query->where('status', BookingStatus::CheckedOut->value)])
            ->withSum('bookings as total_booking_value', 'total_amount')
            ->withSum(['payments as total_paid' => fn (Builder $query) => $query->whereIn('payments.status', [PaymentStatus::Partial->value, PaymentStatus::Paid->value])], 'amount_paid')
            ->withMax('bookings as latest_check_in', 'check_in');
    }
}
