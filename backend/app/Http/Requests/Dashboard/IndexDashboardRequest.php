<?php

namespace App\Http\Requests\Dashboard;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexDashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('dashboard.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'days' => ['nullable', 'integer', Rule::in([7, 30, 90]), Rule::prohibitedIf(fn (): bool => $this->filled('from') || $this->filled('to'))],
            'from' => ['nullable', 'date_format:Y-m-d', 'required_with:to', Rule::prohibitedIf(fn (): bool => $this->filled('days'))],
            'to' => ['nullable', 'date_format:Y-m-d', 'required_with:from', 'after_or_equal:from', Rule::prohibitedIf(fn (): bool => $this->filled('days'))],
        ];
    }
}
