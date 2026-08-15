<?php

namespace App\Enums;

enum RoomType: string
{
    case Studio = 'studio';
    case Suite = 'suite';
    case Loft = 'loft';
    case Deluxe = 'deluxe';

    public function label(): string
    {
        return match ($this) {
            self::Studio => 'Studio',
            self::Suite => 'Suite',
            self::Loft => 'Loft',
            self::Deluxe => 'Deluxe',
        };
    }
}
