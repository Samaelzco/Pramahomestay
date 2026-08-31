<?php

namespace App\Contracts\Services;

use App\Models\Booking;
use App\Models\EmailNotification;
use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EmailNotificationServiceInterface
{
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function find(int $id): EmailNotification;

    public function bookingCreated(Booking $booking, string $paymentToken): void;

    public function paymentProofSubmitted(Payment $payment): void;

    public function paymentVerified(Payment $payment): void;

    public function paymentRejected(Payment $payment, string $reason): void;

    public function bookingCancelled(Booking $booking, ?string $reason): void;

    public function paymentExpired(Booking $booking): void;

    public function internalBookingCreated(Booking $booking): void;

    public function internalPaymentProofSubmitted(Payment $payment): void;

    public function internalCheckInDue(Booking $booking, string $date): void;

    public function internalCheckOutDue(Booking $booking, string $date): void;

    public function send(int $notificationId): void;

    public function markFailed(int $notificationId, string $message): void;
}
