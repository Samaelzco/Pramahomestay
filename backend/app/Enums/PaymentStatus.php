<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case Partial = 'partial';
    case Paid = 'paid';
    case Failed = 'failed';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Belum dibayar',
            self::Partial => 'Dibayar sebagian',
            self::Paid => 'Lunas',
            self::Failed => 'Gagal',
            self::Refunded => 'Dikembalikan',
        };
    }
}
