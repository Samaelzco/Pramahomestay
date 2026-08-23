<?php

namespace App\Http\Requests\Rooms;

use App\Enums\RoomStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreRoomRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('amenity_ids_present') && ! $this->has('amenity_ids')) {
            $this->merge(['amenity_ids' => []]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->can('rooms.create') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('rooms', 'name')],
            'status' => ['required', Rule::enum(RoomStatus::class)],
            'description' => ['nullable', 'string', 'max:2000'],
            'price_per_night' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'capacity' => ['required', 'integer', 'min:1', 'max:20'],
            'bed_count' => ['required', 'integer', 'min:1', 'max:10'],
            'image_url' => ['nullable', 'url:http,https', 'max:2048'],
            'image' => ['nullable', File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max('5mb')],
            'remove_image' => ['sometimes', 'boolean'],
            'amenity_ids' => ['present', 'array', 'max:30'],
            'amenity_ids.*' => ['integer', 'distinct', Rule::exists('amenities', 'id')->whereNull('deleted_at')->where('is_active', true)],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
