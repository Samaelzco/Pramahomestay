<?php

namespace Database\Seeders;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::query()->where('booking_code', 'PRM-DEMO-001')->first();
        $admin = User::query()->where('email', config('initial-admin.email'))->first();

        if (! $booking) {
            return;
        }

        Payment::query()->updateOrCreate(
            ['payment_code' => 'PAY-DEMO-001'],
            [
                'booking_id' => $booking->id,
                'amount_paid' => $booking->total_amount,
                'method' => PaymentMethod::BankTransfer,
                'status' => PaymentStatus::Paid,
                'reference_number' => 'TRX-DEMO-001',
                'paid_at' => now()->subDay(),
                'notes' => 'Data contoh pembayaran lunas.',
                'proof_url' => null,
                'proof_path' => null,
                'created_by' => $admin?->id,
            ],
        );
    }
}
