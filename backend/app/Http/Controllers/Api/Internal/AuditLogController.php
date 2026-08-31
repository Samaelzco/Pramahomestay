<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\AuditLogServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\AuditLogs\IndexAuditLogRequest;
use App\Http\Resources\AuditLogResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AuditLogController extends Controller
{
    public function __construct(private readonly AuditLogServiceInterface $auditLogs) {}

    public function index(IndexAuditLogRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 20);
        unset($validated['per_page'], $validated['page']);

        return AuditLogResource::collection($this->auditLogs->paginate($validated, $perPage))
            ->additional(['filter_options' => ['actors' => $this->auditLogs->actorOptions()]]);
    }

    public function show(IndexAuditLogRequest $request, int $auditLog): AuditLogResource
    {
        return new AuditLogResource($this->auditLogs->findOrFail($auditLog));
    }
}
