<?php

namespace App\Http\Requests\Amenities;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAmenityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('amenities.create') ?? false;
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:100', Rule::unique('amenities', 'name')], 'name_en' => ['nullable', 'string', 'max:100'], 'description' => ['nullable', 'string', 'max:500'], 'description_en' => ['nullable', 'string', 'max:500'], 'is_active' => ['required', 'boolean']];
    }
}
