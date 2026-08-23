<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomestaySettingResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'maps_url' => $this->maps_url,
            'phone' => $this->phone,
            'email' => $this->email,
            'logo_url' => $this->logo_url,
            'check_in_time' => $this->check_in_time ? substr($this->check_in_time, 0, 5) : null,
            'check_out_time' => $this->check_out_time ? substr($this->check_out_time, 0, 5) : null,
            'timezone' => $this->timezone,
            'currency' => $this->currency,
            'bank_name' => $this->bank_name,
            'bank_account_number' => $this->bank_account_number,
            'bank_account_holder' => $this->bank_account_holder,
            'qris_notes' => $this->qris_notes,
            'booking_code_prefix' => $this->booking_code_prefix,
            'payment_code_prefix' => $this->payment_code_prefix,
            'cancellation_policy' => $this->cancellation_policy,
            'payment_instructions' => $this->payment_instructions,
            'updated_at' => $this->updated_at,
        ];
    }
}
