<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('type')->index();
            $table->string('status')->default('ready')->index();
            $table->text('description')->nullable();
            $table->decimal('price_per_night', 12, 2)->index();
            $table->unsignedSmallInteger('capacity')->index();
            $table->unsignedSmallInteger('bed_count')->default(1);
            $table->decimal('size_sqm', 6, 2)->nullable();
            $table->text('image_url')->nullable();
            $table->jsonb('amenities')->default('[]');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'type']);
            $table->index(['is_active', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
