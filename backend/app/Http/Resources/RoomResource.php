<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing(['amenities', 'images']);
        $bookingCount = array_key_exists('all_bookings_count', $this->resource->getAttributes())
            ? (int) $this->all_bookings_count
            : $this->bookings()->withTrashed()->count();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'description' => $this->description,
            'description_en' => $this->description_en,
            'price_per_night' => $this->price_per_night,
            'capacity' => $this->capacity,
            'bed_count' => $this->bed_count,
            'image_url' => $this->images->first()?->url,
            'images' => $this->images->values()->map(fn ($image, int $index): array => [
                'id' => $image->id,
                'url' => $image->url,
                'is_cover' => $index === 0,
            ])->all(),
            'amenities' => AmenityResource::collection($this->amenities)->resolve($request),
            'is_active' => $this->is_active,
            'can_delete' => $bookingCount === 0,
            'delete_block_reason' => $bookingCount > 0 ? 'Memiliki riwayat booking' : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
