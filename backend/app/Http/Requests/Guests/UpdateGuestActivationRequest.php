<?php

namespace App\Http\Requests\Guests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGuestActivationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('guests.update') ?? false;
    }

    public function rules(): array
    {
        return ['is_active' => ['required', 'boolean']];
    }
}
