<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $bookingCount = array_key_exists('all_bookings_count', $this->resource->getAttributes())
            ? (int) $this->all_bookings_count
            : $this->bookings()->withTrashed()->count();

        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'can_delete' => $bookingCount === 0,
            'delete_block_reason' => $bookingCount > 0 ? 'Memiliki riwayat booking' : null,
            'stats' => [
                'bookings' => (int) ($this->bookings_count ?? 0),
                'completed_stays' => (int) ($this->completed_stays_count ?? 0),
                'total_booking_value' => number_format((float) ($this->total_booking_value ?? 0), 2, '.', ''),
                'total_paid' => number_format((float) ($this->total_paid ?? 0), 2, '.', ''),
                'latest_check_in' => $this->latest_check_in,
            ],
            'bookings' => BookingResource::collection($this->whenLoaded('bookings')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
