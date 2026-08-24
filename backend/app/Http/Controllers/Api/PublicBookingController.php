<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\BookingServiceInterface;
use App\Http\Controllers\Controller;
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
            ],
        ], 201);
    }
}
