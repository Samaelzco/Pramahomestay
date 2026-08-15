<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\RoomServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Rooms\IndexRoomRequest;
use App\Http\Requests\Rooms\StoreRoomRequest;
use App\Http\Requests\Rooms\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
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
}
