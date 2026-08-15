<?php

namespace App\Enums;

enum RoomStatus: string
{
    case Ready = 'ready';
    case Occupied = 'occupied';
    case Cleaning = 'cleaning';
    case Maintenance = 'maintenance';

    public function label(): string
    {
        return match ($this) {
            self::Ready => 'Siap',
            self::Occupied => 'Terisi',
            self::Cleaning => 'Dibersihkan',
            self::Maintenance => 'Perawatan',
        };
    }
}
