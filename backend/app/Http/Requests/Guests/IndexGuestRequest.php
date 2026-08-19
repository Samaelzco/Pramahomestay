<?php

namespace App\Http\Requests\Guests;

use Illuminate\Foundation\Http\FormRequest;

class IndexGuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('guests.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'is_active' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
