<?php

namespace App\Services;

use App\Contracts\Repositories\AuditLogRepositoryInterface;
use App\Contracts\Services\AuditLogServiceInterface;
use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AuditLogService implements AuditLogServiceInterface
{
    public function __construct(private readonly AuditLogRepositoryInterface $auditLogs) {}

    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->auditLogs->paginate($filters, $perPage);
    }

    public function findOrFail(int $id): AuditLog
    {
        return $this->auditLogs->findOrFail($id);
    }

    public function actorOptions(): Collection
    {
        return $this->auditLogs->actorOptions();
    }
}
