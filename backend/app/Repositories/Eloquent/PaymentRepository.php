<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function __construct(private readonly Payment $model) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->with('booking.room')
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $term = '%'.mb_strtolower($search).'%';
                $query->where(function ($query) use ($term): void {
                    $query->whereRaw('LOWER(payment_code) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(reference_number) LIKE ?', [$term])
                        ->orWhereHas('booking', function ($query) use ($term): void {
                            $query->whereRaw('LOWER(booking_code) LIKE ?', [$term])
                                ->orWhereRaw('LOWER(guest_name) LIKE ?', [$term]);
                        });
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['method'] ?? null, fn ($query, string $method) => $query->where('method', $method))
            ->when($filters['booking_id'] ?? null, fn ($query, int $bookingId) => $query->where('booking_id', $bookingId))
            ->when($filters['date_from'] ?? null, fn ($query, string $date) => $query->whereDate('paid_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, string $date) => $query->whereDate('paid_at', '<=', $date))
            ->orderByDesc('paid_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $attributes): Payment
    {
        return $this->model->newQuery()->create($attributes)->load('booking.room');
    }

    public function update(Payment $payment, array $attributes): Payment
    {
        $payment->updateOrFail($attributes);

        return $payment->refresh()->load('booking.room');
    }

    public function existsForBooking(int $bookingId, ?int $ignoreId = null): bool
    {
        return $this->model->newQuery()
            ->where('booking_id', $bookingId)
            ->when($ignoreId, fn ($query, int $id) => $query->whereKeyNot($id))
            ->exists();
    }

    public function codeExists(string $code): bool
    {
        return $this->model->newQuery()->where('payment_code', $code)->exists();
    }
}
