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
            'hero_media_type' => ['sometimes', Rule::in(['image', 'video'])],
            'hero_images' => ['nullable', 'array', 'max:5'],
            'hero_images.*' => [File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max('8mb')],
            'remove_hero_image_ids' => ['nullable', 'array', 'max:5'],
            'remove_hero_image_ids.*' => ['required', 'uuid', 'distinct'],
            'hero_video' => ['nullable', File::types(['mp4', 'webm'])->max('50mb')],
            'remove_hero_video' => ['sometimes', 'boolean'],
            'hero_cycle_seconds' => ['sometimes', 'integer', 'min:3', 'max:15'],
            'final_cta_image' => ['nullable', File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max('8mb')],
            'remove_final_cta_image' => ['sometimes', 'boolean'],
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
            'mail_enabled' => ['sometimes', 'boolean'],
            'mail_host' => ['nullable', 'required_if:mail_enabled,1', 'string', 'max:255'],
            'mail_port' => ['nullable', 'required_if:mail_enabled,1', 'integer', 'min:1', 'max:65535'],
            'mail_username' => ['nullable', 'string', 'max:255'],
            'mail_password' => ['nullable', 'string', 'max:1000'],
            'mail_encryption' => ['nullable', Rule::in(['tls', 'ssl'])],
            'mail_from_address' => ['nullable', 'required_if:mail_enabled,1', 'email', 'max:255'],
            'mail_from_name' => ['nullable', 'string', 'max:120'],
            'guest_email_locale' => ['sometimes', Rule::in(['id', 'en'])],
        ];
    }
}
