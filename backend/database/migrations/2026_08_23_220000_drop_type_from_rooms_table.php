<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('rooms', 'type')) {
            return;
        }

        Schema::table('rooms', function (Blueprint $table): void {
            $table->dropIndex(['status', 'type']);
            $table->dropIndex(['type']);
            $table->dropColumn('type');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('rooms', 'type')) {
            return;
        }

        Schema::table('rooms', function (Blueprint $table): void {
            $table->string('type')->default('room')->index();
            $table->index(['status', 'type']);
        });
    }
};
