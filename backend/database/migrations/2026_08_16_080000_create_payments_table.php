<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->string('payment_code', 24)->unique();
            $table->foreignId('booking_id')->unique()->constrained()->restrictOnDelete();
            $table->decimal('amount_paid', 14, 2)->default(0)->index();
            $table->string('method')->nullable()->index();
            $table->string('status')->default('unpaid')->index();
            $table->string('reference_number', 120)->nullable()->index();
            $table->timestampTz('paid_at')->nullable()->index();
            $table->text('notes')->nullable();
            $table->text('proof_url')->nullable();
            $table->string('proof_path')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'paid_at']);
            $table->index(['method', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
