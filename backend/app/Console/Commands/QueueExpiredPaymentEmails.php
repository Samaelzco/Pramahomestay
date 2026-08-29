<?php

namespace App\Console\Commands;

use App\Contracts\Services\EmailNotificationServiceInterface;
use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use Illuminate\Console\Command;

class QueueExpiredPaymentEmails extends Command
{
    protected $signature = 'notifications:queue-expired';

    protected $description = 'Queue notifications for expired unpaid public bookings';

    public function handle(EmailNotificationServiceInterface $notifications): int
    {
        Booking::query()->with(['room', 'payment'])->where('status', BookingStatus::Pending->value)
            ->whereNotNull('payment_due_at')->where('payment_due_at', '<=', now())
            ->where(fn ($query) => $query->whereDoesntHave('payment')->orWhereHas('payment', fn ($query) => $query->whereIn('status', [PaymentStatus::Unpaid->value, PaymentStatus::Failed->value])))
            ->chunkById(100, fn ($bookings) => $bookings->each(fn (Booking $booking) => $notifications->paymentExpired($booking)));

        return self::SUCCESS;
    }
}
