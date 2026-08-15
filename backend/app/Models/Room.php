<?php

namespace App\Models;

use App\Enums\RoomStatus;
use App\Enums\RoomType;
use Database\Factories\RoomFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'slug',
    'type',
    'status',
    'description',
    'price_per_night',
    'capacity',
    'bed_count',
    'size_sqm',
    'image_url',
    'image_path',
    'amenities',
    'is_active',
])]
class Room extends Model
{
    /** @use HasFactory<RoomFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'type' => RoomType::class,
            'status' => RoomStatus::class,
            'price_per_night' => 'decimal:2',
            'capacity' => 'integer',
            'bed_count' => 'integer',
            'size_sqm' => 'decimal:2',
            'amenities' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
