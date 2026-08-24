<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AmenityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $count = isset($this->rooms_count) ? (int) $this->rooms_count : $this->rooms()->count();

        return ['id' => $this->id, 'name' => $this->name, 'name_en' => $this->name_en, 'slug' => $this->slug, 'description' => $this->description, 'description_en' => $this->description_en, 'is_active' => $this->is_active, 'room_count' => $count, 'can_delete' => $count === 0, 'created_at' => $this->created_at, 'updated_at' => $this->updated_at];
    }
}
