<?php

namespace App\Http\Requests\Availability;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('bookings.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'start' => ['nullable', 'date_format:Y-m-d'],
            'view' => ['nullable', Rule::in(['day', 'week', 'month'])],
        ];
    }
}
