<?php

namespace App\Http\Requests\Operations;

use Illuminate\Foundation\Http\FormRequest;

class IndexOperationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('bookings.view') ?? false;
    }

    public function rules(): array
    {
        return ['date' => ['nullable', 'date_format:Y-m-d']];
    }
}
