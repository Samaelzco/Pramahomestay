<?php

namespace App\Http\Requests\Availability;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('rooms.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'title' => ['required', 'string', 'max:120'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after:start_date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
