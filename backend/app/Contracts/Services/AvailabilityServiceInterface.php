<?php

namespace App\Contracts\Services;

use App\Models\RoomBlock;

interface AvailabilityServiceInterface
{
    /** @return array<string, mixed> */
    public function calendar(array $filters = []): array;

    /** @param array<string, mixed> $attributes */
    public function createBlock(array $attributes, ?int $createdBy = null): RoomBlock;

    public function deleteBlock(RoomBlock $block): void;
}
