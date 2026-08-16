<?php

namespace App\Contracts\Services;

use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PaymentServiceInterface
{
    /** @return LengthAwarePaginator<int, Payment> */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $attributes, ?int $createdBy = null): Payment;

    public function update(Payment $payment, array $attributes): Payment;
}
