<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->string('public_access_token_hash', 64)->nullable()->unique()->after('booking_code');
            $table->timestampTz('payment_due_at')->nullable()->index()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropUnique(['public_access_token_hash']);
            $table->dropIndex(['payment_due_at']);
            $table->dropColumn(['public_access_token_hash', 'payment_due_at']);
        });
    }
};
