<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\BookingServiceInterface;
use App\Contracts\Services\HomestaySettingServiceInterface;
use App\Contracts\Services\PaymentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payments\StorePublicPaymentProofRequest;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;

class PublicPaymentController extends Controller
{
    public function __construct(
        private readonly BookingServiceInterface $bookings,
        private readonly PaymentServiceInterface $payments,
        private readonly HomestaySettingServiceInterface $settings,
    ) {}

    public function show(string $token): JsonResponse
    {
        return response()->json(['data' => $this->payload($this->bookings->findPublicByToken($token))]);
    }

    public function store(StorePublicPaymentProofRequest $request, string $token): JsonResponse
    {
        $booking = $this->bookings->findPublicByToken($token);
        $payment = $this->payments->submitPublicProof($booking, $request->validated());

        return response()->json([
            'message' => 'Bukti pembayaran berhasil dikirim dan menunggu verifikasi.',
            'data' => $this->payload($booking->refresh()->load(['room.images', 'payment'])),
        ], 201);
    }

    private function payload(Booking $booking): array
    {
        $payment = $booking->relationLoaded('payment')
            ? $booking->payment
            : $this->payments->findForBooking($booking->id);
        $settings = $this->settings->current();

        return [
            'property' => [
                'name' => $settings->name,
                'logo_url' => $settings->logo_url,
                'phone' => $settings->phone,
                'email' => $settings->email,
                'bank_name' => $settings->bank_name,
                'bank_account_number' => $settings->bank_account_number,
                'bank_account_holder' => $settings->bank_account_holder,
                'qris_notes' => $settings->qris_notes,
                'payment_instructions' => $settings->payment_instructions,
            ],
            'booking' => [
                'booking_code' => $booking->booking_code,
                'room_name' => $booking->room->name,
                'room_image_url' => $booking->room->images->first()?->url,
                'guest_name' => $booking->guest_name,
                'check_in' => $booking->check_in->toDateString(),
                'check_out' => $booking->check_out->toDateString(),
                'guest_count' => $booking->guest_count,
                'total_nights' => $booking->total_nights,
                'total_amount' => $booking->total_amount,
                'status' => $booking->status->value,
                'payment_due_at' => $booking->payment_due_at?->toIso8601String(),
                'payment_expired' => $booking->payment_due_at?->isPast() ?? false,
            ],
            'payment' => $payment ? $this->paymentPayload($payment) : null,
        ];
    }

    private function paymentPayload(Payment $payment): array
    {
        return [
            'payment_code' => $payment->payment_code,
            'status' => $payment->status->value,
            'status_label' => $payment->status->label(),
            'reference_number' => $payment->reference_number,
            'proof_url' => $payment->proof_url,
            'submitted_at' => $payment->paid_at?->toIso8601String(),
        ];
    }
}
