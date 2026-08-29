<?php

namespace App\Services;

use App\Contracts\Repositories\AvailabilityRepositoryInterface;
use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Services\AvailabilityServiceInterface;
use App\Models\RoomBlock;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AvailabilityService implements AvailabilityServiceInterface
{
    public function __construct(
        private readonly AvailabilityRepositoryInterface $availability,
        private readonly BookingRepositoryInterface $bookings,
        private readonly RoomRepositoryInterface $rooms,
    ) {}

    public function calendar(array $filters = []): array
    {
        $view = $filters['view'] ?? 'week';
        $requestedStart = CarbonImmutable::parse($filters['start'] ?? now()->toDateString())->startOfDay();
        $start = $view === 'month' ? $requestedStart->startOfMonth() : $requestedStart;
        $end = match ($view) {
            'day' => $start->addDay(),
            'month' => $start->addMonth(),
            default => $start->addDays(7),
        };
        $allRooms = $this->availability->roomsForPeriod($start, $end);
        $selectedRoomId = isset($filters['room_id']) ? (int) $filters['room_id'] : null;
        $rooms = $selectedRoomId
            ? $allRooms->where('id', $selectedRoomId)->values()
            : $allRooms;
        $days = $start->diffInDays($end);
        $occupiedRoomDays = 0;
        $blockedRoomDays = 0;

        $roomRows = $rooms->map(function ($room) use ($start, $end, &$occupiedRoomDays, &$blockedRoomDays): array {
            $countInSummary = (bool) $room->is_active;
            $bookings = $room->bookings->map(function ($booking) use ($start, $end, $countInSummary, &$occupiedRoomDays): array {
                $entryStart = CarbonImmutable::parse($booking->check_in)->max($start);
                $entryEnd = CarbonImmutable::parse($booking->check_out)->min($end);
                if ($countInSummary) {
                    $occupiedRoomDays += $entryStart->diffInDays($entryEnd);
                }

                return [
                    'type' => 'booking',
                    'id' => $booking->id,
                    'label' => $booking->guest_name,
                    'code' => $booking->booking_code,
                    'status' => $booking->status->value,
                    'status_label' => $booking->status->label(),
                    'start' => $booking->check_in->toDateString(),
                    'end' => $booking->check_out->toDateString(),
                    'href' => '/internal/bookings/'.$booking->id,
                ];
            });
            $blocks = $room->roomBlocks->map(function ($block) use ($start, $end, $countInSummary, &$blockedRoomDays): array {
                $entryStart = CarbonImmutable::parse($block->start_date)->max($start);
                $entryEnd = CarbonImmutable::parse($block->end_date)->min($end);
                if ($countInSummary) {
                    $blockedRoomDays += $entryStart->diffInDays($entryEnd);
                }

                return [
                    'type' => 'block',
                    'id' => $block->id,
                    'label' => $block->title,
                    'code' => null,
                    'status' => 'blocked',
                    'status_label' => 'Diblokir',
                    'start' => $block->start_date->toDateString(),
                    'end' => $block->end_date->toDateString(),
                    'href' => null,
                ];
            });

            return [
                'id' => $room->id,
                'name' => $room->name,
                'is_active' => $room->is_active,
                'status' => $room->status->value,
                'entries' => $bookings->concat($blocks)->sortBy('start')->values()->all(),
            ];
        })->values();

        $activeRooms = $rooms->where('is_active', true)->count();
        $availableRoomDays = max(0, ($activeRooms * $days) - $occupiedRoomDays - $blockedRoomDays);
        $sellableRoomDays = max(1, ($activeRooms * $days) - $blockedRoomDays);

        return [
            'period' => ['view' => $view, 'start' => $start->toDateString(), 'end' => $end->toDateString(), 'days' => $days],
            'filters' => ['room_id' => $selectedRoomId],
            'room_options' => $allRooms->map(fn ($room): array => [
                'id' => $room->id,
                'name' => $room->name,
                'is_active' => (bool) $room->is_active,
            ])->values()->all(),
            'summary' => [
                'active_rooms' => $activeRooms,
                'occupied_room_days' => $occupiedRoomDays,
                'blocked_room_days' => $blockedRoomDays,
                'available_room_days' => $availableRoomDays,
                'occupancy_rate' => round(($occupiedRoomDays / $sellableRoomDays) * 100, 1),
            ],
            'rooms' => $roomRows,
        ];
    }

    public function createBlock(array $attributes, ?int $createdBy = null): RoomBlock
    {
        return DB::transaction(function () use ($attributes, $createdBy): RoomBlock {
            $room = $this->rooms->findForUpdate((int) $attributes['room_id']);
            if ($this->bookings->hasDateConflict($room->id, $attributes['start_date'], $attributes['end_date'])) {
                throw ValidationException::withMessages(['start_date' => 'Kamar sudah memiliki booking pada rentang tanggal tersebut.']);
            }
            if ($this->availability->hasBlockConflict($room->id, $attributes['start_date'], $attributes['end_date'])) {
                throw ValidationException::withMessages(['start_date' => 'Kamar sudah diblokir pada rentang tanggal tersebut.']);
            }

            return $this->availability->createBlock([...$attributes, 'created_by' => $createdBy]);
        });
    }

    public function deleteBlock(RoomBlock $block): void
    {
        DB::transaction(function () use ($block): void {
            $this->availability->deleteBlock($this->availability->findBlockForUpdate($block->id));
        });
    }
}
