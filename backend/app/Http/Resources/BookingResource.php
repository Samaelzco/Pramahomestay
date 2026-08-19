<?php

namespace App\Http\Resources;

use App\Enums\BookingStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $paymentExists = array_key_exists('any_payment_exists', $this->resource->getAttributes())
            ? (bool) $this->any_payment_exists
            : $this->payment()->withTrashed()->exists();

        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'room' => new RoomResource($this->whenLoaded('room')),
            'guest' => $this->whenLoaded('guest', fn () => [
                'id' => $this->guest->id,
                'full_name' => $this->guest->full_name,
                'email' => $this->guest->email,
                'phone' => $this->guest->phone,
            ]),
            'guest_name' => $this->guest_name,
            'guest_email' => $this->guest_email,
            'guest_phone' => $this->guest_phone,
            'check_in' => $this->check_in->toDateString(),
            'check_out' => $this->check_out->toDateString(),
            'guest_count' => $this->guest_count,
            'price_per_night' => $this->price_per_night,
            'total_nights' => $this->total_nights,
            'total_amount' => $this->total_amount,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'can_delete' => in_array($this->status, [BookingStatus::Pending, BookingStatus::Cancelled], true) && ! $paymentExists,
            'delete_block_reason' => $paymentExists
                ? 'Memiliki data pembayaran'
                : (! in_array($this->status, [BookingStatus::Pending, BookingStatus::Cancelled], true) ? 'Status operasional aktif' : null),
            'special_requests' => $this->special_requests,
            'internal_notes' => $this->internal_notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
