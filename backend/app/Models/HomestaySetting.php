<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name', 'address', 'maps_url', 'phone', 'email', 'logo_path', 'logo_url',
    'check_in_time', 'check_out_time', 'timezone', 'currency', 'bank_name',
    'bank_account_number', 'bank_account_holder', 'qris_notes', 'booking_code_prefix',
    'payment_code_prefix', 'cancellation_policy', 'payment_instructions',
])]
class HomestaySetting extends Model
{
    // A single row represents the active property configuration.
}
