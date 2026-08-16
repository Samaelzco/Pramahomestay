<?php

namespace App\Contracts\Services;

interface DashboardServiceInterface
{
    public function summary(int $days = 30): array;
}
