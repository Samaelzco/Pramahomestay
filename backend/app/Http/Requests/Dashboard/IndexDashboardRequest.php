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
        return ['days' => ['nullable', 'integer', Rule::in([7, 30, 90])]];
    }
}
