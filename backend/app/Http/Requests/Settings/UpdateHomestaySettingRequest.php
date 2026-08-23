<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class UpdateHomestaySettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('settings.update') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:2000'],
            'maps_url' => ['required', 'url:http,https', 'max:2048'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'logo' => ['nullable', File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max('3mb')],
            'remove_logo' => ['sometimes', 'boolean'],
            'check_in_time' => ['nullable', 'date_format:H:i'],
            'check_out_time' => ['nullable', 'date_format:H:i'],
            'timezone' => ['required', Rule::in(['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'])],
            'currency' => ['required', Rule::in(['IDR'])],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:80'],
            'bank_account_holder' => ['nullable', 'string', 'max:120'],
            'qris_notes' => ['nullable', 'string', 'max:1000'],
            'booking_code_prefix' => ['required', 'string', 'min:2', 'max:10', 'regex:/^[A-Z0-9-]+$/'],
            'payment_code_prefix' => ['required', 'string', 'min:2', 'max:10', 'regex:/^[A-Z0-9-]+$/'],
            'cancellation_policy' => ['nullable', 'string', 'max:5000'],
            'payment_instructions' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
