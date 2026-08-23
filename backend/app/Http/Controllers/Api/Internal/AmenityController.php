<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\AmenityServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Amenities\IndexAmenityRequest;
use App\Http\Requests\Amenities\StoreAmenityRequest;
use App\Http\Requests\Amenities\UpdateAmenityActivationRequest;
use App\Http\Requests\Amenities\UpdateAmenityRequest;
use App\Http\Resources\AmenityResource;
use App\Models\Amenity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AmenityController extends Controller
{
    public function __construct(private readonly AmenityServiceInterface $amenities) {}

    public function index(IndexAmenityRequest $request): AnonymousResourceCollection
    {
        $data = $request->validated();
        $perPage = (int) ($data['per_page'] ?? 15);
        unset($data['per_page'], $data['page']);

        return AmenityResource::collection($this->amenities->paginate($data, $perPage));
    }

    public function store(StoreAmenityRequest $request): AmenityResource
    {
        return (new AmenityResource($this->amenities->create($request->validated())))->additional(['message' => 'Fasilitas berhasil ditambahkan.']);
    }

    public function show(Amenity $amenity): AmenityResource
    {
        return new AmenityResource($amenity);
    }

    public function update(UpdateAmenityRequest $request, Amenity $amenity): AmenityResource
    {
        return (new AmenityResource($this->amenities->update($amenity, $request->validated())))->additional(['message' => 'Fasilitas berhasil diperbarui.']);
    }

    public function activation(UpdateAmenityActivationRequest $request, Amenity $amenity): AmenityResource
    {
        $amenity = $this->amenities->setActive($amenity, (bool) $request->validated('is_active'));

        return (new AmenityResource($amenity))->additional(['message' => $amenity->is_active ? 'Fasilitas berhasil diaktifkan.' : 'Fasilitas berhasil dinonaktifkan.']);
    }

    public function destroy(Amenity $amenity): JsonResponse
    {
        $this->amenities->delete($amenity);

        return response()->json(['message' => 'Fasilitas berhasil dihapus.']);
    }
}
