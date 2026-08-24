<?php

namespace App\Http\Requests\Reports;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reports.export') ?? false;
    }

    public function rules(): array
    {
        return [
            'format' => ['required', Rule::in(['csv', 'pdf'])],
            'locale' => ['nullable', Rule::in(['id', 'en'])],
            'date_from' => ['nullable', 'date_format:Y-m-d', 'required_with:date_to'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'required_with:date_from', 'after_or_equal:date_from'],
        ];
    }
}
