<?php

namespace App\Enums;

enum EmailNotificationStatus: string
{
    case Queued = 'queued';
    case Sent = 'sent';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Queued => 'Dalam antrean',
            self::Sent => 'Terkirim',
            self::Failed => 'Gagal',
        };
    }
}
