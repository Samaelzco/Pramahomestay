<?php

namespace App\Http\Requests\Amenities;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAmenityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('amenities.update') ?? false;
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:100', Rule::unique('amenities', 'name')->ignore($this->route('amenity'))], 'name_en' => ['nullable', 'string', 'max:100'], 'description' => ['nullable', 'string', 'max:500'], 'description_en' => ['nullable', 'string', 'max:500'], 'is_active' => ['required', 'boolean']];
    }
}
