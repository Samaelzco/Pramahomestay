<?php

namespace App\Http\Requests\Payments;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('payments.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'amount_paid' => ['required', 'numeric', 'min:0', 'max:999999999999.99'],
            'method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'status' => ['required', Rule::enum(PaymentStatus::class)],
            'reference_number' => ['nullable', 'string', 'max:120'],
            'paid_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'proof' => ['nullable', File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max('5mb')],
            'remove_proof' => ['sometimes', 'boolean'],
        ];
    }
}
