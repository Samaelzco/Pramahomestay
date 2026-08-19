<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $bookingCount = array_key_exists('all_bookings_count', $this->resource->getAttributes())
            ? (int) $this->all_bookings_count
            : $this->bookings()->withTrashed()->count();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'description' => $this->description,
            'price_per_night' => $this->price_per_night,
            'capacity' => $this->capacity,
            'bed_count' => $this->bed_count,
            'size_sqm' => $this->size_sqm,
            'image_url' => $this->image_url,
            'amenities' => $this->amenities,
            'is_active' => $this->is_active,
            'can_delete' => $bookingCount === 0,
            'delete_block_reason' => $bookingCount > 0 ? 'Memiliki riwayat booking' : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
