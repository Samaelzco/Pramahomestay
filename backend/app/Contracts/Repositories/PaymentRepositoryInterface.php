<?php

namespace App\Contracts\Repositories;

use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PaymentRepositoryInterface
{
    /** @return LengthAwarePaginator<int, Payment> */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $attributes): Payment;

    public function update(Payment $payment, array $attributes): Payment;

    public function findForUpdate(int $id): Payment;

    public function existsForBooking(int $bookingId, ?int $ignoreId = null): bool;

    public function hasCreditedPaymentForBooking(int $bookingId): bool;

    public function codeExists(string $code): bool;
}
