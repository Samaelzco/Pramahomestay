<?php

namespace App\Http\Requests\Rooms;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomActivationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('rooms.update') ?? false;
    }

    public function rules(): array
    {
        return ['is_active' => ['required', 'boolean']];
    }
}
