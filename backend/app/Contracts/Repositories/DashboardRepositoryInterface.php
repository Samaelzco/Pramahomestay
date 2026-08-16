<?php

namespace App\Contracts\Repositories;

use Carbon\CarbonImmutable;

interface DashboardRepositoryInterface
{
    public function snapshot(CarbonImmutable $start, CarbonImmutable $end): array;
}
