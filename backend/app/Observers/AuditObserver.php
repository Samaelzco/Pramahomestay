<?php

namespace App\Observers;

use App\Models\Booking;
use App\Models\Payment;
use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Model;

class AuditObserver
{
    public function __construct(private readonly AuditLogger $logger) {}

    public function created(Model $model): void
    {
        $this->logger->record($model, 'created', [], $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $changed = array_keys($model->getChanges());
        $previousStatus = $model->getRawOriginal('status');
        $currentStatus = $model instanceof Payment ? $model->getAttribute('status')?->value : null;
        $oldValues = collect($changed)->mapWithKeys(fn (string $key): array => [$key => $model->getRawOriginal($key)])->all();
        $newValues = collect($changed)->mapWithKeys(fn (string $key): array => [$key => $model->getAttribute($key)])->all();

        $action = match (true) {
            in_array('is_active', $changed, true) => $model->getAttribute('is_active') ? 'activated' : 'deactivated',
            $model instanceof Booking && $model->getAttribute('status')?->value === 'cancelled' => 'cancelled',
            $model instanceof Payment && $currentStatus === 'refunded' => 'refunded',
            $model instanceof Payment && $previousStatus === 'pending_verification' && in_array($currentStatus, ['partial', 'paid'], true) => 'verified',
            $model instanceof Payment && $previousStatus === 'pending_verification' && $currentStatus === 'failed' => 'rejected',
            default => 'updated',
        };

        $this->logger->record($model, $action, $oldValues, $newValues);
    }

    public function deleted(Model $model): void
    {
        $this->logger->record($model, 'deleted', $model->getAttributes());
    }
}
