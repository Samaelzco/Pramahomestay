<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\AvailabilityServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Availability\IndexAvailabilityRequest;
use App\Http\Requests\Availability\StoreRoomBlockRequest;
use App\Models\RoomBlock;
use Illuminate\Http\JsonResponse;

class AvailabilityController extends Controller
{
    public function __construct(private readonly AvailabilityServiceInterface $availability) {}

    public function index(IndexAvailabilityRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->availability->calendar($request->validated())]);
    }

    public function storeBlock(StoreRoomBlockRequest $request): JsonResponse
    {
        $block = $this->availability->createBlock($request->validated(), $request->user()?->id);

        return response()->json([
            'message' => 'Kamar berhasil diblokir.',
            'data' => ['id' => $block->id],
        ], 201);
    }

    public function destroyBlock(RoomBlock $roomBlock): JsonResponse
    {
        $this->availability->deleteBlock($roomBlock);

        return response()->json(['message' => 'Blok kamar berhasil dihapus.']);
    }
}
