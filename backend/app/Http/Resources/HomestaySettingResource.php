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
            'hero_media_type' => $this->hero_media_type,
            'hero_images' => $this->hero_images ?? [],
            'hero_video_url' => $this->hero_video_url,
            'hero_cycle_seconds' => $this->hero_cycle_seconds,
            'final_cta_image_url' => $this->final_cta_image_url,
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
            'mail_enabled' => (bool) $this->mail_enabled,
            'mail_host' => $this->mail_host,
            'mail_port' => $this->mail_port,
            'mail_username' => $this->mail_username,
            'mail_password_configured' => filled($this->mail_password),
            'mail_encryption' => $this->mail_encryption,
            'mail_from_address' => $this->mail_from_address,
            'mail_from_name' => $this->mail_from_name,
            'guest_email_locale' => $this->guest_email_locale ?? 'id',
            'updated_at' => $this->updated_at,
        ];
    }
}
