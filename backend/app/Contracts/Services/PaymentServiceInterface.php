<?php

namespace App\Contracts\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PaymentServiceInterface
{
    /** @return LengthAwarePaginator<int, Payment> */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $attributes, ?int $createdBy = null): Payment;

    public function findForBooking(int $bookingId): ?Payment;

    public function submitPublicProof(Booking $booking, array $attributes): Payment;

    public function update(Payment $payment, array $attributes): Payment;

    public function verify(Payment $payment): Payment;

    public function reject(Payment $payment, string $reason): Payment;

    public function refund(Payment $payment, string $reason): Payment;
}
