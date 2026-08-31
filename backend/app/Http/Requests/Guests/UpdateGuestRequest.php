<?php

namespace App\Http\Requests\Guests;

use Illuminate\Validation\Rule;

class UpdateGuestRequest extends StoreGuestRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('guests.update') ?? false;
    }

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'email' => ['required', 'email:rfc', 'max:255', Rule::unique('guests', 'email')->ignore($this->route('guest'))],
        ];
    }
}
