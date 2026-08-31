<?php

namespace App\Http\Requests\Payments;

class UpdatePaymentRequest extends StorePaymentRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('payments.update') ?? false;
    }
}
