<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\BookingServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Bookings\CancelBookingRequest;
use App\Http\Requests\Bookings\IndexBookingRequest;
use App\Http\Requests\Bookings\StoreBookingRequest;
use App\Http\Requests\Bookings\UpdateBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BookingController extends Controller
{
    public function __construct(private readonly BookingServiceInterface $bookings) {}

    public function index(IndexBookingRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);
        unset($validated['per_page'], $validated['page']);

        return BookingResource::collection($this->bookings->paginate($validated, $perPage));
    }

    public function store(StoreBookingRequest $request): BookingResource
    {
        $booking = $this->bookings->create($request->validated(), $request->user()?->id);

        return (new BookingResource($booking))->additional(['message' => 'Booking berhasil ditambahkan.']);
    }

    public function show(Booking $booking): BookingResource
    {
        return new BookingResource($booking->load(['room', 'guest']));
    }

    public function update(UpdateBookingRequest $request, Booking $booking): BookingResource
    {
        $booking = $this->bookings->update($booking, $request->validated());

        return (new BookingResource($booking))->additional(['message' => 'Booking berhasil diperbarui.']);
    }

    public function cancel(CancelBookingRequest $request, Booking $booking): BookingResource
    {
        $booking = $this->bookings->cancel($booking, $request->validated('reason'));

        return (new BookingResource($booking))->additional(['message' => 'Booking berhasil dibatalkan.']);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        $this->bookings->delete($booking);

        return response()->json(['message' => 'Booking berhasil dihapus.']);
    }
}
