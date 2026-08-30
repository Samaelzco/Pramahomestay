<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_notifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('event_key');
            $table->string('type')->index();
            $table->string('title');
            $table->string('title_en');
            $table->text('message');
            $table->text('message_en');
            $table->string('action_url');
            $table->timestampTz('read_at')->nullable()->index();
            $table->timestampsTz();

            $table->unique(['user_id', 'event_key']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_notifications');
    }
};
