<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name', 'address', 'maps_url', 'phone', 'email', 'logo_path', 'logo_url',
    'hero_media_type', 'hero_images', 'hero_video_path', 'hero_video_url', 'hero_cycle_seconds',
    'final_cta_image_path', 'final_cta_image_url',
    'check_in_time', 'check_out_time', 'timezone', 'currency', 'bank_name',
    'bank_account_number', 'bank_account_holder', 'qris_notes', 'booking_code_prefix',
    'payment_code_prefix', 'cancellation_policy', 'payment_instructions',
])]
class HomestaySetting extends Model
{
    // A single row represents the active property configuration.

    protected function casts(): array
    {
        return [
            'hero_images' => 'array',
            'hero_cycle_seconds' => 'integer',
        ];
    }
}
