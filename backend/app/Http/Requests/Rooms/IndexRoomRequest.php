<?php

namespace App\Http\Requests\Rooms;

use App\Enums\RoomStatus;
use App\Enums\RoomType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('rooms.view') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(RoomStatus::class)],
            'type' => ['nullable', Rule::enum(RoomType::class)],
            'is_active' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
