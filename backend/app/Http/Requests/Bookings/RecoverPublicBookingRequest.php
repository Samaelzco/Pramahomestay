<?php

namespace App\Http\Requests\Bookings;

use Illuminate\Foundation\Http\FormRequest;

class RecoverPublicBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'booking_code' => ['required', 'string', 'min:4', 'max:40', 'regex:/^[A-Za-z0-9-]+$/'],
            'contact' => ['required', 'string', 'min:5', 'max:255'],
            'website' => ['nullable', 'prohibited'],
        ];
    }
}
