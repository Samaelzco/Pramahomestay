<?php

namespace App\Services;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Contracts\Services\GuestServiceInterface;
use App\Models\Guest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class GuestService implements GuestServiceInterface
{
    public function __construct(private readonly GuestRepositoryInterface $guests) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->guests->paginate($filters, $perPage);
    }

    public function create(array $attributes, ?int $createdBy = null): Guest
    {
        return DB::transaction(function () use ($attributes, $createdBy): Guest {
            $attributes = $this->normalize($attributes);
            $attributes['created_by'] = $createdBy;

            return $this->guests->create($attributes);
        });
    }

    public function update(Guest $guest, array $attributes): Guest
    {
        return DB::transaction(fn (): Guest => $this->guests->update($guest, $this->normalize($attributes)));
    }

    public function details(Guest $guest): Guest
    {
        return $this->guests->withDetails($guest);
    }

    private function normalize(array $attributes): array
    {
        $attributes['full_name'] = trim($attributes['full_name']);
        $attributes['email'] = mb_strtolower(trim($attributes['email']));
        $attributes['phone'] = trim($attributes['phone']);

        return $attributes;
    }
}
