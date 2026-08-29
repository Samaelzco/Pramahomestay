<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmailNotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'type' => $this->type->value, 'type_label' => $this->type->label(),
            'status' => $this->status->value, 'status_label' => $this->status->label(), 'locale' => $this->locale,
            'recipient_name' => $this->recipient_name, 'recipient_email' => $this->recipient_email, 'subject' => $this->subject,
            'booking_code' => $this->booking?->booking_code, 'payment_code' => $this->payment?->payment_code,
            'attempts' => $this->attempts, 'error_message' => $this->error_message,
            'queued_at' => $this->queued_at?->toIso8601String(), 'sent_at' => $this->sent_at?->toIso8601String(),
            'failed_at' => $this->failed_at?->toIso8601String(), 'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
