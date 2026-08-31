<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('audit_logs')
            ->select(['id', 'old_values', 'new_values'])
            ->orderBy('id')
            ->chunkById(100, function ($logs): void {
                foreach ($logs as $log) {
                    $oldValues = $this->withoutMailPassword($log->old_values);
                    $newValues = $this->withoutMailPassword($log->new_values);

                    DB::table('audit_logs')->where('id', $log->id)->update([
                        'old_values' => $oldValues === null ? null : json_encode($oldValues, JSON_THROW_ON_ERROR),
                        'new_values' => $newValues === null ? null : json_encode($newValues, JSON_THROW_ON_ERROR),
                    ]);
                }
            });
    }

    public function down(): void
    {
        // Redacted credentials must never be restored.
    }

    /** @return array<string, mixed>|null */
    private function withoutMailPassword(mixed $values): ?array
    {
        if ($values === null) {
            return null;
        }

        $decoded = is_string($values) ? json_decode($values, true, flags: JSON_THROW_ON_ERROR) : (array) $values;
        unset($decoded['mail_password']);

        return $decoded === [] ? null : $decoded;
    }
};
