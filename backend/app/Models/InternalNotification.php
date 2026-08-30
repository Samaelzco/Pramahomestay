<?php

namespace App\Models;

use App\Enums\InternalNotificationType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'event_key', 'type', 'title', 'title_en', 'message', 'message_en', 'action_url', 'read_at',
])]
class InternalNotification extends Model
{
    protected function casts(): array
    {
        return [
            'type' => InternalNotificationType::class,
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
