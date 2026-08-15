<?php

namespace App\Services;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Services\BookingServiceInterface;
use App\Enums\BookingStatus;
use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingService implements BookingServiceInterface
{
    public function __construct(
        private readonly BookingRepositoryInterface $bookings,
        private readonly RoomRepositoryInterface $rooms,
    ) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->bookings->paginate($filters, $perPage);
    }

    public function create(array $attributes, ?int $createdBy = null): Booking
    {
        return DB::transaction(function () use ($attributes, $createdBy): Booking {
            $room = $this->rooms->findForUpdate((int) $attributes['room_id']);

            if (! $room->is_active) {
                throw ValidationException::withMessages(['room_id' => 'Kamar yang dipilih sedang tidak aktif.']);
            }

            $attributes = $this->prepareAttributes($attributes, $room->id, $room->capacity, (string) $room->price_per_night);
            $attributes['booking_code'] = $this->uniqueCode();
            $attributes['created_by'] = $createdBy;

            return $this->bookings->create($attributes);
        });
    }

    public function update(Booking $booking, array $attributes): Booking
    {
        return DB::transaction(function () use ($booking, $attributes): Booking {
            $room = $this->rooms->findForUpdate((int) $attributes['room_id']);

            if ($room->id !== $booking->room_id && ! $room->is_active) {
                throw ValidationException::withMessages(['room_id' => 'Kamar yang dipilih sedang tidak aktif.']);
            }

            $price = $room->id === $booking->room_id
                ? (string) $booking->price_per_night
                : (string) $room->price_per_night;
            $attributes = $this->prepareAttributes($attributes, $room->id, $room->capacity, $price, $booking->id);

            return $this->bookings->update($booking, $attributes);
        });
    }

    private function prepareAttributes(array $attributes, int $roomId, int $capacity, string $price, ?int $ignoreId = null): array
    {
        if ((int) $attributes['guest_count'] > $capacity) {
            throw ValidationException::withMessages([
                'guest_count' => "Kapasitas kamar maksimal {$capacity} tamu.",
            ]);
        }

        if ($attributes['status'] !== BookingStatus::Cancelled->value
            && $this->bookings->hasDateConflict($roomId, $attributes['check_in'], $attributes['check_out'], $ignoreId)) {
            throw ValidationException::withMessages([
                'check_in' => 'Kamar sudah memiliki booking pada rentang tanggal tersebut.',
            ]);
        }

        $nights = CarbonImmutable::parse($attributes['check_in'])->diffInDays(CarbonImmutable::parse($attributes['check_out']));
        $attributes['price_per_night'] = $price;
        $attributes['total_nights'] = $nights;
        $attributes['total_amount'] = bcmul($price, (string) $nights, 2);

        return $attributes;
    }

    private function uniqueCode(): string
    {
        do {
            $code = 'PRM-'.now()->format('ym').'-'.Str::upper(Str::random(6));
        } while ($this->bookings->codeExists($code));

        return $code;
    }
}
