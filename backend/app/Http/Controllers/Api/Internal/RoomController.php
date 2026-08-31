<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\RoomServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Rooms\IndexRoomRequest;
use App\Http\Requests\Rooms\StoreRoomRequest;
use App\Http\Requests\Rooms\UpdateRoomActivationRequest;
use App\Http\Requests\Rooms\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoomController extends Controller
{
    public function __construct(private readonly RoomServiceInterface $rooms) {}

    public function index(IndexRoomRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 12);
        unset($validated['per_page'], $validated['page']);

        return RoomResource::collection($this->rooms->paginate($validated, $perPage));
    }

    public function store(StoreRoomRequest $request): RoomResource
    {
        $room = $this->rooms->create($request->validated());

        return (new RoomResource($room))->additional([
            'message' => 'Kamar berhasil ditambahkan.',
        ]);
    }

    public function show(Room $room): RoomResource
    {
        return new RoomResource($room);
    }

    public function update(UpdateRoomRequest $request, Room $room): RoomResource
    {
        $room = $this->rooms->update($room, $request->validated());

        return (new RoomResource($room))->additional([
            'message' => 'Kamar berhasil diperbarui.',
        ]);
    }

    public function activation(UpdateRoomActivationRequest $request, Room $room): RoomResource
    {
        $room = $this->rooms->setActive($room, (bool) $request->validated('is_active'));

        return (new RoomResource($room))->additional([
            'message' => $room->is_active ? 'Kamar berhasil diaktifkan.' : 'Kamar berhasil dinonaktifkan.',
        ]);
    }

    public function destroy(Room $room): JsonResponse
    {
        $this->rooms->delete($room);

        return response()->json(['message' => 'Kamar berhasil dihapus.']);
    }
}
