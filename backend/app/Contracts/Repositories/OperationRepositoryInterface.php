<?php

namespace App\Contracts\Repositories;

use Carbon\CarbonImmutable;

interface OperationRepositoryInterface
{
    /** @return array<string, mixed> */
    public function snapshot(CarbonImmutable $date): array;

    public function hasCheckedInBooking(int $roomId, ?int $ignoreBookingId = null): bool;
}
