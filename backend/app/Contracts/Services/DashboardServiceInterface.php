<?php

namespace App\Contracts\Services;

interface DashboardServiceInterface
{
    public function summary(array $filters = []): array;
}
