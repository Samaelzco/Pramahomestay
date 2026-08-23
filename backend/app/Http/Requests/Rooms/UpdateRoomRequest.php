<?php

namespace App\Http\Requests\Rooms;

use App\Enums\RoomStatus;
use App\Models\Room;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class UpdateRoomRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('amenities_json')) {
            $this->merge(['amenities' => json_decode((string) $this->input('amenities_json'), true) ?? []]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->can('rooms.update') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        /** @var Room $room */
        $room = $this->route('room');

        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('rooms', 'name')->ignore($room)],
            'status' => ['required', Rule::enum(RoomStatus::class)],
            'description' => ['nullable', 'string', 'max:2000'],
            'price_per_night' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'capacity' => ['required', 'integer', 'min:1', 'max:20'],
            'bed_count' => ['required', 'integer', 'min:1', 'max:10'],
            'size_sqm' => ['nullable', 'numeric', 'min:1', 'max:9999.99'],
            'image_url' => ['nullable', 'url:http,https', 'max:2048'],
            'image' => ['nullable', File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max('5mb')],
            'remove_image' => ['sometimes', 'boolean'],
            'amenities' => ['present', 'array', 'max:20'],
            'amenities.*' => ['required', 'string', 'max:50', 'distinct:ignore_case'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
