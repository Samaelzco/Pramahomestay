<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homestay_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->text('address');
            $table->string('maps_url', 2048);
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('logo_url', 2048)->nullable();
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->string('timezone', 64)->default('Asia/Makassar');
            $table->char('currency', 3)->default('IDR');
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_number', 80)->nullable();
            $table->string('bank_account_holder', 120)->nullable();
            $table->text('qris_notes')->nullable();
            $table->string('booking_code_prefix', 10)->default('PRM');
            $table->string('payment_code_prefix', 10)->default('PAY');
            $table->text('cancellation_policy')->nullable();
            $table->text('payment_instructions')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homestay_settings');
    }
};
