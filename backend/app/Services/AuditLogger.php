<?php

namespace App\Services;

use App\Models\Amenity;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\HomestaySetting;
use App\Models\Payment;
use App\Models\Role;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class AuditLogger
{
    /** @var array<int, string> */
    private const EXCLUDED_FIELDS = [
        'password',
        'mail_password',
        'remember_token',
        'updated_at',
        'deleted_at',
    ];

    /** @param array<string, mixed> $oldValues
     * @param  array<string, mixed>  $newValues
     */
    public function record(Model $subject, string $action, array $oldValues = [], array $newValues = [], ?string $description = null): void
    {
        $actorId = auth()->id();
        if ($actorId === null) {
            return;
        }

        $oldValues = $this->sanitize($oldValues);
        $newValues = $this->sanitize($newValues);
        if ($action === 'updated' && $oldValues === [] && $newValues === []) {
            return;
        }

        $module = $this->module($subject);
        $label = $this->subjectLabel($subject);

        AuditLog::query()->create([
            'actor_id' => $actorId,
            'action' => $action,
            'module' => $module,
            'subject_type' => $subject::class,
            'subject_id' => $subject->getKey(),
            'subject_label' => $label,
            'description' => $description ?? $this->description($module, $label, $action),
            'old_values' => $oldValues ?: null,
            'new_values' => $newValues ?: null,
            'ip_address' => request()->ip(),
            'user_agent' => mb_substr((string) request()->userAgent(), 0, 500) ?: null,
        ]);
    }

    /** @param array{start: string, end: string, days: int} $period */
    public function recordReportExport(string $format, array $period): void
    {
        $actorId = auth()->id();
        if ($actorId === null) {
            return;
        }

        $setting = HomestaySetting::query()->first();
        AuditLog::query()->create([
            'actor_id' => $actorId,
            'action' => 'exported',
            'module' => 'reports',
            'subject_type' => HomestaySetting::class,
            'subject_id' => $setting?->getKey(),
            'subject_label' => "{$period['start']}—{$period['end']}",
            'description' => 'Laporan periode '.$period['start'].' sampai '.$period['end'].' diekspor sebagai '.strtoupper($format).'.',
            'old_values' => null,
            'new_values' => ['format' => $format, 'date_from' => $period['start'], 'date_to' => $period['end']],
            'ip_address' => request()->ip(),
            'user_agent' => mb_substr((string) request()->userAgent(), 0, 500) ?: null,
        ]);
    }

    /** @param array<string, mixed> $values
     * @return array<string, mixed>
     */
    private function sanitize(array $values): array
    {
        $values = Arr::except($values, self::EXCLUDED_FIELDS);

        return collect($values)
            ->map(fn (mixed $value): mixed => $value instanceof \BackedEnum ? $value->value : $value)
            ->all();
    }

    private function module(Model $subject): string
    {
        return match (true) {
            $subject instanceof Room => 'rooms',
            $subject instanceof Amenity => 'amenities',
            $subject instanceof Booking => 'bookings',
            $subject instanceof Payment => 'payments',
            $subject instanceof Guest => 'guests',
            $subject instanceof User => 'users',
            $subject instanceof Role => 'roles',
            $subject instanceof HomestaySetting => 'settings',
            default => 'system',
        };
    }

    private function subjectLabel(Model $subject): string
    {
        foreach (['booking_code', 'payment_code', 'display_name', 'name', 'full_name', 'email'] as $attribute) {
            $value = $subject->getAttribute($attribute);
            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        return '#'.$subject->getKey();
    }

    private function description(string $module, string $label, string $action): string
    {
        $moduleLabel = [
            'rooms' => 'Kamar', 'bookings' => 'Booking', 'payments' => 'Pembayaran',
            'amenities' => 'Fasilitas',
            'guests' => 'Tamu', 'users' => 'User', 'roles' => 'Role', 'system' => 'Data',
            'settings' => 'Pengaturan',
            'reports' => 'Laporan',
        ][$module];
        $actionLabel = [
            'created' => 'ditambahkan', 'updated' => 'diperbarui', 'deleted' => 'dihapus',
            'activated' => 'diaktifkan', 'deactivated' => 'dinonaktifkan',
            'cancelled' => 'dibatalkan', 'refunded' => 'dikembalikan',
            'verified' => 'diverifikasi', 'rejected' => 'ditolak',
            'exported' => 'diekspor',
        ][$action] ?? 'diubah';

        return "{$moduleLabel} {$label} {$actionLabel}.";
    }
}
