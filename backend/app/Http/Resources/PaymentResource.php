<?php

namespace App\Http\Resources;

use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $creditedAmount = in_array($this->status, [PaymentStatus::Partial, PaymentStatus::Paid], true)
            ? (string) $this->amount_paid
            : '0';
        $remaining = max(0, (float) $this->booking->total_amount - (float) $creditedAmount);

        return [
            'id' => $this->id,
            'payment_code' => $this->payment_code,
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'amount_paid' => $this->amount_paid,
            'credited_amount' => number_format((float) $creditedAmount, 2, '.', ''),
            'remaining_amount' => number_format($remaining, 2, '.', ''),
            'method' => $this->method?->value,
            'method_label' => $this->method?->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'reference_number' => $this->reference_number,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'notes' => $this->notes,
            'proof_url' => $this->proof_url,
            'can_update' => $request->user()?->can('payments.update') ?? false,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
