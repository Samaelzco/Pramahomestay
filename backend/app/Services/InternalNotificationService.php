<?php

namespace App\Services;

use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Repositories\InternalNotificationRepositoryInterface;
use App\Contracts\Repositories\OperationRepositoryInterface;
use App\Contracts\Services\InternalNotificationServiceInterface;
use App\Enums\BookingStatus;
use App\Enums\InternalNotificationType;
use App\Models\Booking;
use App\Models\InternalNotification;
use App\Models\Payment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InternalNotificationService implements InternalNotificationServiceInterface
{
    public function __construct(
        private readonly InternalNotificationRepositoryInterface $notifications,
        private readonly OperationRepositoryInterface $operations,
        private readonly HomestaySettingRepositoryInterface $settings,
    ) {}

    public function paginate(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->notifications->paginateForUser($user, $filters, $perPage);
    }

    public function summary(User $user): array
    {
        return [
            'unread_count' => $this->notifications->unreadCountForUser($user),
            'notifications' => $this->notifications->latestForUser($user),
            'timezone' => $this->settings->current()->timezone,
        ];
    }

    public function bookingCreated(Booking $booking): void
    {
        $booking->loadMissing('room');
        $this->notifications->createForPermission('bookings.view', [
            'event_key' => "booking:{$booking->id}:created",
            'type' => InternalNotificationType::BookingCreated->value,
            'title' => 'Booking baru masuk',
            'title_en' => 'New booking received',
            'message' => "{$booking->guest_name} membuat booking {$booking->booking_code} untuk {$booking->room->name}.",
            'message_en' => "{$booking->guest_name} created booking {$booking->booking_code} for {$booking->room->name}.",
            'action_url' => "/internal/bookings/{$booking->id}",
        ]);
    }

    public function paymentProofSubmitted(Payment $payment): void
    {
        $payment->loadMissing('booking');
        $booking = $payment->booking;
        $proofKey = hash('sha256', (string) $payment->proof_path);
        $this->notifications->createForPermission('payments.update', [
            'event_key' => "payment:{$payment->id}:proof:{$proofKey}",
            'type' => InternalNotificationType::PaymentProofSubmitted->value,
            'title' => 'Bukti pembayaran baru',
            'title_en' => 'New payment proof',
            'message' => "{$booking->guest_name} mengunggah bukti pembayaran untuk {$booking->booking_code}.",
            'message_en' => "{$booking->guest_name} uploaded payment proof for {$booking->booking_code}.",
            'action_url' => "/internal/payments/{$payment->id}",
        ]);
    }

    public function queueDailyReminders(): int
    {
        $timezone = $this->settings->current()->timezone;
        $today = CarbonImmutable::today($timezone);
        $snapshot = $this->operations->snapshot($today);
        $created = 0;

        foreach ($snapshot['arrivals'] as $booking) {
            if ($booking->status !== BookingStatus::Confirmed || $booking->check_in->toDateString() !== $today->toDateString()) {
                continue;
            }
            $created += $this->notifications->createForPermission('bookings.update', [
                'event_key' => "booking:{$booking->id}:check-in:{$today->toDateString()}",
                'type' => InternalNotificationType::CheckInDue->value,
                'title' => 'Check-in hari ini',
                'title_en' => 'Check-in today',
                'message' => "{$booking->guest_name} dijadwalkan check-in ke {$booking->room->name} hari ini.",
                'message_en' => "{$booking->guest_name} is scheduled to check in to {$booking->room->name} today.",
                'action_url' => "/internal/operations?date={$today->toDateString()}",
            ]);
        }

        foreach ($snapshot['departures'] as $booking) {
            if ($booking->status !== BookingStatus::CheckedIn || $booking->check_out->toDateString() !== $today->toDateString()) {
                continue;
            }
            $created += $this->notifications->createForPermission('bookings.update', [
                'event_key' => "booking:{$booking->id}:check-out:{$today->toDateString()}",
                'type' => InternalNotificationType::CheckOutDue->value,
                'title' => 'Check-out hari ini',
                'title_en' => 'Check-out today',
                'message' => "{$booking->guest_name} dijadwalkan check-out dari {$booking->room->name} hari ini.",
                'message_en' => "{$booking->guest_name} is scheduled to check out from {$booking->room->name} today.",
                'action_url' => "/internal/operations?date={$today->toDateString()}",
            ]);
        }

        return $created;
    }

    public function markRead(User $user, int $id): InternalNotification
    {
        return $this->notifications->markRead($this->notifications->findForUser($user, $id));
    }

    public function markAllRead(User $user): int
    {
        return $this->notifications->markAllRead($user);
    }

    public function unreadCount(User $user): int
    {
        return $this->notifications->unreadCountForUser($user);
    }

    public function timezone(): string
    {
        return $this->settings->current()->timezone;
    }
}
