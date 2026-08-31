<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\BookingServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Bookings\RecoverPublicBookingRequest;
use App\Http\Requests\Bookings\StorePublicBookingRequest;
use Illuminate\Http\JsonResponse;

class PublicBookingController extends Controller
{
    public function __construct(private readonly BookingServiceInterface $bookings) {}

    public function store(StorePublicBookingRequest $request): JsonResponse
    {
        $booking = $this->bookings->createPublic($request->safe()->except('website'));

        return response()->json([
            'message' => 'Permintaan booking berhasil dikirim.',
            'data' => [
                'booking_code' => $booking->booking_code,
                'room_name' => $booking->room->name,
                'check_in' => $booking->check_in->toDateString(),
                'check_out' => $booking->check_out->toDateString(),
                'guest_count' => $booking->guest_count,
                'total_nights' => $booking->total_nights,
                'total_amount' => $booking->total_amount,
                'status' => $booking->status->value,
                'payment_token' => $booking->public_access_token,
                'payment_due_at' => $booking->payment_due_at?->toIso8601String(),
            ],
        ], 201);
    }

    public function recover(RecoverPublicBookingRequest $request): JsonResponse
    {
        $token = $this->bookings->recoverPublicAccess(
            (string) $request->validated('booking_code'),
            (string) $request->validated('contact'),
        );

        return response()->json([
            'message' => 'Pesanan berhasil ditemukan.',
            'data' => ['payment_token' => $token],
        ]);
    }
}
