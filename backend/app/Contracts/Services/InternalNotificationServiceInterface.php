<?php

namespace App\Contracts\Services;

use App\Models\Booking;
use App\Models\InternalNotification;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface InternalNotificationServiceInterface
{
    public function paginate(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function summary(User $user): array;

    public function bookingCreated(Booking $booking): void;

    public function paymentProofSubmitted(Payment $payment): void;

    public function queueDailyReminders(): int;

    public function markRead(User $user, int $id): InternalNotification;

    public function markAllRead(User $user): int;

    public function unreadCount(User $user): int;

    public function timezone(): string;
}
