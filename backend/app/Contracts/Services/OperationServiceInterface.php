<?php

namespace App\Contracts\Services;

use App\Models\Booking;
use App\Models\Room;

interface OperationServiceInterface
{
    /** @return array<string, mixed> */
    public function daily(array $filters = []): array;

    public function checkIn(Booking $booking, ?int $userId = null, ?string $note = null): Booking;

    public function checkOut(Booking $booking, ?int $userId = null, ?string $note = null): Booking;

    public function markRoomReady(Room $room): Room;
}
