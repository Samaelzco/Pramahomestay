<?php

namespace App\Services;

use App\Contracts\Repositories\EmailNotificationRepositoryInterface;
use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\EmailNotificationServiceInterface;
use App\Enums\EmailNotificationStatus;
use App\Enums\EmailNotificationType;
use App\Jobs\SendGuestEmail;
use App\Mail\GuestTransactionalMail;
use App\Mail\InternalTransactionalMail;
use App\Models\Booking;
use App\Models\EmailNotification;
use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class EmailNotificationService implements EmailNotificationServiceInterface
{
    public function __construct(
        private readonly EmailNotificationRepositoryInterface $notifications,
        private readonly HomestaySettingRepositoryInterface $settings,
        private readonly UserRepositoryInterface $users,
    ) {}

    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->notifications->paginate($filters, $perPage);
    }

    public function find(int $id): EmailNotification
    {
        return $this->notifications->find($id);
    }

    public function bookingCreated(Booking $booking, string $paymentToken): void
    {
        $this->queue($booking, null, EmailNotificationType::BookingCreated, "booking:{$booking->id}:created", [
            'payment_due_at' => $booking->payment_due_at?->toIso8601String(),
        ], rtrim((string) config('app.frontend_url'), '/').'/booking/payment/'.$paymentToken);
    }

    public function paymentProofSubmitted(Payment $payment): void
    {
        $this->queue($payment->booking, $payment, EmailNotificationType::PaymentProofSubmitted, 'payment:'.$payment->id.':proof:'.Str::uuid());
    }

    public function paymentVerified(Payment $payment): void
    {
        $this->queue($payment->booking, $payment, EmailNotificationType::PaymentVerified, "payment:{$payment->id}:verified");
    }

    public function paymentRejected(Payment $payment, string $reason): void
    {
        $this->queue($payment->booking, $payment, EmailNotificationType::PaymentRejected, 'payment:'.$payment->id.':rejected:'.Str::uuid(), ['reason' => $reason]);
    }

    public function bookingCancelled(Booking $booking, ?string $reason): void
    {
        $this->queue($booking, $booking->payment, EmailNotificationType::BookingCancelled, "booking:{$booking->id}:cancelled", ['reason' => $reason]);
    }

    public function paymentExpired(Booking $booking): void
    {
        $this->queue($booking, $booking->payment, EmailNotificationType::PaymentExpired, "booking:{$booking->id}:expired");
    }

    public function internalBookingCreated(Booking $booking): void
    {
        $booking->loadMissing('room');
        $this->queueInternal(
            $booking,
            null,
            'bookings.view',
            EmailNotificationType::BookingCreated,
            "booking:{$booking->id}:created",
            'Booking baru perlu diperiksa',
            "{$booking->guest_name} membuat booking {$booking->booking_code} untuk {$booking->room->name}.",
            "/internal/bookings/{$booking->id}",
        );
    }

    public function internalPaymentProofSubmitted(Payment $payment): void
    {
        $payment->loadMissing('booking.room');
        $booking = $payment->booking;
        $proofKey = hash('sha256', (string) $payment->proof_path);
        $this->queueInternal(
            $booking,
            $payment,
            'payments.update',
            EmailNotificationType::PaymentProofSubmitted,
            "payment:{$payment->id}:proof:{$proofKey}",
            'Bukti pembayaran baru perlu diverifikasi',
            "{$booking->guest_name} mengunggah bukti pembayaran untuk {$booking->booking_code}.",
            "/internal/payments/{$payment->id}",
        );
    }

    public function internalCheckInDue(Booking $booking, string $date): void
    {
        $booking->loadMissing('room');
        $this->queueInternal(
            $booking,
            null,
            'bookings.update',
            EmailNotificationType::CheckInDue,
            "booking:{$booking->id}:check-in:{$date}",
            'Check-in dijadwalkan hari ini',
            "{$booking->guest_name} dijadwalkan check-in ke {$booking->room->name} hari ini.",
            "/internal/operations?date={$date}",
        );
    }

    public function internalCheckOutDue(Booking $booking, string $date): void
    {
        $booking->loadMissing('room');
        $this->queueInternal(
            $booking,
            null,
            'bookings.update',
            EmailNotificationType::CheckOutDue,
            "booking:{$booking->id}:check-out:{$date}",
            'Check-out dijadwalkan hari ini',
            "{$booking->guest_name} dijadwalkan check-out dari {$booking->room->name} hari ini.",
            "/internal/operations?date={$date}",
        );
    }

    private function queue(Booking $booking, ?Payment $payment, EmailNotificationType $type, string $eventKey, array $extra = [], ?string $actionUrl = null): void
    {
        $settings = $this->settings->current();
        if (! $settings->mail_enabled || ! $settings->mail_host || ! $settings->mail_port || ! $settings->mail_from_address) {
            return;
        }

        $locale = in_array($settings->guest_email_locale, ['id', 'en'], true) ? $settings->guest_email_locale : 'id';
        $subjects = $this->copy($type, $locale);
        $notification = $this->notifications->createOnce([
            'booking_id' => $booking->id,
            'payment_id' => $payment?->id,
            'event_key' => $eventKey,
            'type' => $type->value,
            'status' => EmailNotificationStatus::Queued->value,
            'locale' => $locale,
            'recipient_name' => $booking->guest_name,
            'recipient_email' => $booking->guest_email,
            'subject' => $subjects['subject'],
            'action_url' => $actionUrl,
            'payload' => [
                'property_name' => $settings->name,
                'booking_code' => $booking->booking_code,
                'room_name' => $booking->room?->name,
                'check_in' => $booking->check_in?->toDateString(),
                'check_out' => $booking->check_out?->toDateString(),
                'total_amount' => (string) $booking->total_amount,
                'payment_code' => $payment?->payment_code,
                ...$extra,
            ],
            'queued_at' => now(),
        ]);
        if ($notification) {
            SendGuestEmail::dispatch($notification->id);
        }
    }

    private function queueInternal(
        Booking $booking,
        ?Payment $payment,
        string $permission,
        EmailNotificationType $type,
        string $eventKey,
        string $subject,
        string $message,
        string $actionPath,
    ): void {
        $settings = $this->settings->current();
        if (! $settings->mail_enabled || ! $settings->mail_host || ! $settings->mail_port || ! $settings->mail_from_address) {
            return;
        }

        foreach ($this->users->internalEmailRecipients($permission) as $user) {
            $notification = $this->notifications->createOnce([
                'booking_id' => $booking->id,
                'payment_id' => $payment?->id,
                'user_id' => $user->id,
                'event_key' => "internal:user:{$user->id}:{$eventKey}",
                'type' => $type->value,
                'status' => EmailNotificationStatus::Queued->value,
                'recipient_scope' => 'internal',
                'locale' => 'id',
                'recipient_name' => $user->name,
                'recipient_email' => $user->email,
                'subject' => $subject,
                'action_url' => rtrim((string) config('app.frontend_url'), '/').$actionPath,
                'payload' => [
                    'property_name' => $settings->name,
                    'booking_code' => $booking->booking_code,
                    'room_name' => $booking->room?->name,
                    'check_in' => $booking->check_in?->toDateString(),
                    'check_out' => $booking->check_out?->toDateString(),
                    'message' => $message,
                ],
                'queued_at' => now(),
            ]);
            if ($notification) {
                SendGuestEmail::dispatch($notification->id);
            }
        }
    }

    public function send(int $notificationId): void
    {
        $notification = $this->notifications->find($notificationId);
        if ($notification->status === EmailNotificationStatus::Sent) {
            return;
        }
        $settings = $this->settings->current();
        $attempts = $notification->attempts + 1;
        $this->notifications->update($notification, ['attempts' => $attempts, 'error_message' => null]);
        $this->configureMailer($settings);

        try {
            $notification = $notification->refresh();
            $mail = $notification->recipient_scope === 'internal'
                ? new InternalTransactionalMail($notification)
                : new GuestTransactionalMail($notification);
            Mail::mailer('prama_smtp')->to($notification->recipient_email, $notification->recipient_name)->send($mail);
            $this->notifications->update($notification, ['status' => EmailNotificationStatus::Sent->value, 'sent_at' => now(), 'failed_at' => null]);
        } catch (Throwable $exception) {
            $this->notifications->update($notification, ['status' => EmailNotificationStatus::Failed->value, 'failed_at' => now(), 'error_message' => Str::limit($exception->getMessage(), 2000)]);
            throw $exception;
        }
    }

    public function markFailed(int $notificationId, string $message): void
    {
        $notification = $this->notifications->find($notificationId);
        if ($notification->status !== EmailNotificationStatus::Sent) {
            $this->notifications->update($notification, ['status' => EmailNotificationStatus::Failed->value, 'failed_at' => now(), 'error_message' => Str::limit($message, 2000)]);
        }
    }

    private function configureMailer($settings): void
    {
        config([
            'mail.mailers.prama_smtp' => [
                'transport' => 'smtp', 'scheme' => $settings->mail_encryption === 'ssl' ? 'smtps' : null,
                'host' => $settings->mail_host, 'port' => $settings->mail_port,
                'username' => $settings->mail_username ?: null, 'password' => $settings->mail_password ?: null,
                'timeout' => 30, 'local_domain' => parse_url((string) config('app.url'), PHP_URL_HOST),
            ],
            'mail.from.address' => $settings->mail_from_address,
            'mail.from.name' => $settings->mail_from_name ?: $settings->name,
        ]);
        Mail::purge('prama_smtp');
    }

    private function copy(EmailNotificationType $type, string $locale): array
    {
        $id = [
            'booking_created' => 'Booking berhasil dibuat', 'payment_proof_submitted' => 'Bukti pembayaran telah kami terima',
            'payment_verified' => 'Pembayaran berhasil diverifikasi', 'payment_rejected' => 'Bukti pembayaran perlu diperbaiki',
            'booking_cancelled' => 'Booking telah dibatalkan', 'payment_expired' => 'Batas pembayaran telah berakhir',
            'check_in_due' => 'Check-in hari ini', 'check_out_due' => 'Check-out hari ini',
        ];
        $en = [
            'booking_created' => 'Your booking has been created', 'payment_proof_submitted' => 'We received your payment receipt',
            'payment_verified' => 'Your payment has been verified', 'payment_rejected' => 'Your payment receipt needs attention',
            'booking_cancelled' => 'Your booking has been cancelled', 'payment_expired' => 'Your payment deadline has expired',
            'check_in_due' => 'Check-in today', 'check_out_due' => 'Check-out today',
        ];

        return ['subject' => ($locale === 'en' ? $en : $id)[$type->value]];
    }
}
