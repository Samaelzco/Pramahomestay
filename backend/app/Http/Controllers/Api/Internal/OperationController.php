<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\OperationServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Operations\BookingOperationRequest;
use App\Http\Requests\Operations\IndexOperationRequest;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\JsonResponse;

class OperationController extends Controller
{
    public function __construct(private readonly OperationServiceInterface $operations) {}

    public function index(IndexOperationRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->operations->daily($request->validated())]);
    }

    public function checkIn(BookingOperationRequest $request, Booking $booking): JsonResponse
    {
        $this->operations->checkIn($booking, $request->user()?->id, $request->validated('note'));

        return response()->json(['message' => 'Check-in berhasil dicatat.']);
    }

    public function checkOut(BookingOperationRequest $request, Booking $booking): JsonResponse
    {
        $this->operations->checkOut($booking, $request->user()?->id, $request->validated('note'));

        return response()->json(['message' => 'Check-out berhasil dicatat. Kamar masuk antrean pembersihan.']);
    }

    public function markRoomReady(Room $room): JsonResponse
    {
        $this->operations->markRoomReady($room);

        return response()->json(['message' => 'Kamar selesai dibersihkan dan kembali siap.']);
    }
}
