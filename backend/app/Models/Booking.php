<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'booking_code', 'public_access_token_hash', 'room_id', 'guest_id', 'guest_name', 'guest_email', 'guest_phone',
    'check_in', 'check_out', 'guest_count', 'price_per_night', 'total_nights',
    'total_amount', 'status', 'checked_in_at', 'checked_in_by', 'checked_out_at', 'checked_out_by',
    'payment_due_at', 'special_requests', 'internal_notes', 'created_by',
])]
class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'checked_in_at' => 'datetime',
            'checked_out_at' => 'datetime',
            'check_in' => 'date',
            'check_out' => 'date',
            'guest_count' => 'integer',
            'price_per_night' => 'decimal:2',
            'total_nights' => 'integer',
            'total_amount' => 'decimal:2',
            'payment_due_at' => 'datetime',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    public function checkedOutBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_out_by');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
