<?php

namespace App\Contracts\Services;

interface ReportServiceInterface
{
    public function summary(array $filters = []): array;

    public function csv(array $filters = []): string;

    public function pdf(array $filters = []): string;
}
