<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\GuestServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Guests\IndexGuestRequest;
use App\Http\Requests\Guests\StoreGuestRequest;
use App\Http\Requests\Guests\UpdateGuestActivationRequest;
use App\Http\Requests\Guests\UpdateGuestRequest;
use App\Http\Resources\GuestResource;
use App\Models\Guest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GuestController extends Controller
{
    public function __construct(private readonly GuestServiceInterface $guests) {}

    public function index(IndexGuestRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);
        unset($validated['per_page'], $validated['page']);

        return GuestResource::collection($this->guests->paginate($validated, $perPage));
    }

    public function store(StoreGuestRequest $request): GuestResource
    {
        $guest = $this->guests->create($request->validated(), $request->user()?->id);

        return (new GuestResource($guest))->additional(['message' => 'Tamu berhasil ditambahkan.']);
    }

    public function show(Guest $guest): GuestResource
    {
        return new GuestResource($this->guests->details($guest));
    }

    public function update(UpdateGuestRequest $request, Guest $guest): GuestResource
    {
        $guest = $this->guests->update($guest, $request->validated());

        return (new GuestResource($guest))->additional(['message' => 'Data tamu berhasil diperbarui.']);
    }

    public function activation(UpdateGuestActivationRequest $request, Guest $guest): GuestResource
    {
        $guest = $this->guests->setActive($guest, (bool) $request->validated('is_active'));

        return (new GuestResource($guest))->additional([
            'message' => $guest->is_active ? 'Profil tamu berhasil diaktifkan.' : 'Profil tamu berhasil dinonaktifkan.',
        ]);
    }
}
