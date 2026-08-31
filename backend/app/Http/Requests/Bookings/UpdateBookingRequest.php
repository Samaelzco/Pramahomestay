<?php

namespace App\Http\Requests\Bookings;

class UpdateBookingRequest extends StoreBookingRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('bookings.update') ?? false;
    }
}
