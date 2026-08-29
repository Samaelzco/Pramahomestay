<?php

namespace App\Models;

use App\Enums\EmailNotificationStatus;
use App\Enums\EmailNotificationType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'booking_id', 'payment_id', 'event_key', 'type', 'status', 'locale', 'recipient_name',
    'recipient_email', 'subject', 'action_url', 'payload', 'attempts', 'error_message',
    'queued_at', 'sent_at', 'failed_at',
])]
class EmailNotification extends Model
{
    protected function casts(): array
    {
        return [
            'type' => EmailNotificationType::class,
            'status' => EmailNotificationStatus::class,
            'action_url' => 'encrypted',
            'payload' => 'array',
            'queued_at' => 'datetime',
            'sent_at' => 'datetime',
            'failed_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
