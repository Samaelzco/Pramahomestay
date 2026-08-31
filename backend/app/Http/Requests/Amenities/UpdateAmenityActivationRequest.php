<?php

namespace App\Http\Requests\Amenities;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAmenityActivationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('amenities.update') ?? false;
    }

    public function rules(): array
    {
        return ['is_active' => ['required', 'boolean']];
    }
}
