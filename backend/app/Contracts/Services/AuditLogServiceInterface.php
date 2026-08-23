<?php

namespace App\Contracts\Services;

use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface AuditLogServiceInterface
{
    /** @param array<string, mixed> $filters
     * @return LengthAwarePaginator<int, AuditLog>
     */
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function findOrFail(int $id): AuditLog;

    /** @return Collection<int, array{id: int, name: string}> */
    public function actorOptions(): Collection;
}
