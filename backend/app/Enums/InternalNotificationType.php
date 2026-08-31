<?php

namespace App\Enums;

enum InternalNotificationType: string
{
    case BookingCreated = 'booking_created';
    case PaymentProofSubmitted = 'payment_proof_submitted';
    case CheckInDue = 'check_in_due';
    case CheckOutDue = 'check_out_due';

    public function label(): string
    {
        return match ($this) {
            self::BookingCreated => 'Booking baru',
            self::PaymentProofSubmitted => 'Bukti pembayaran',
            self::CheckInDue => 'Check-in',
            self::CheckOutDue => 'Check-out',
        };
    }
}
