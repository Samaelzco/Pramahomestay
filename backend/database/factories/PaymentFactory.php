<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Payment> */
class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'payment_code' => 'PAY-'.fake()->unique()->numerify('########'),
            'booking_id' => Booking::factory(),
            'amount_paid' => 500000,
            'method' => PaymentMethod::BankTransfer,
            'status' => PaymentStatus::Partial,
            'reference_number' => fake()->bothify('REF-####??'),
            'paid_at' => now(),
            'notes' => null,
            'proof_url' => null,
            'proof_path' => null,
            'created_by' => null,
        ];
    }
}
