<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table): void {
            $table->id();
            $table->string('booking_code', 24)->unique();
            $table->foreignId('room_id')->constrained()->restrictOnDelete();
            $table->string('guest_name', 120)->index();
            $table->string('guest_email')->index();
            $table->string('guest_phone', 30)->index();
            $table->date('check_in')->index();
            $table->date('check_out')->index();
            $table->unsignedSmallInteger('guest_count');
            $table->decimal('price_per_night', 12, 2);
            $table->unsignedSmallInteger('total_nights');
            $table->decimal('total_amount', 14, 2)->index();
            $table->string('status')->default('pending')->index();
            $table->text('special_requests')->nullable();
            $table->text('internal_notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['room_id', 'check_in', 'check_out']);
            $table->index(['status', 'check_in']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
