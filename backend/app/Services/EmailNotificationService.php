<?php

namespace App\Services;

use App\Contracts\Repositories\EmailNotificationRepositoryInterface;
use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Services\EmailNotificationServiceInterface;
use App\Enums\EmailNotificationStatus;
use App\Enums\EmailNotificationType;
use App\Jobs\SendGuestEmail;
use App\Mail\GuestTransactionalMail;
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
            Mail::mailer('prama_smtp')->to($notification->recipient_email, $notification->recipient_name)
                ->send(new GuestTransactionalMail($notification->refresh()));
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
        ];
        $en = [
            'booking_created' => 'Your booking has been created', 'payment_proof_submitted' => 'We received your payment receipt',
            'payment_verified' => 'Your payment has been verified', 'payment_rejected' => 'Your payment receipt needs attention',
            'booking_cancelled' => 'Your booking has been cancelled', 'payment_expired' => 'Your payment deadline has expired',
        ];

        return ['subject' => ($locale === 'en' ? $en : $id)[$type->value]];
    }
}
