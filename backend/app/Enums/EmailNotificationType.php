<?php

namespace App\Enums;

enum EmailNotificationType: string
{
    case BookingCreated = 'booking_created';
    case PaymentProofSubmitted = 'payment_proof_submitted';
    case PaymentVerified = 'payment_verified';
    case PaymentRejected = 'payment_rejected';
    case BookingCancelled = 'booking_cancelled';
    case PaymentExpired = 'payment_expired';

    public function label(): string
    {
        return match ($this) {
            self::BookingCreated => 'Booking dibuat',
            self::PaymentProofSubmitted => 'Bukti pembayaran diterima',
            self::PaymentVerified => 'Pembayaran diverifikasi',
            self::PaymentRejected => 'Pembayaran ditolak',
            self::BookingCancelled => 'Booking dibatalkan',
            self::PaymentExpired => 'Batas pembayaran berakhir',
        };
    }
}
