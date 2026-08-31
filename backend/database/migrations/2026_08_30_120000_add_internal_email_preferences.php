<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('receives_internal_email_notifications')->default(false)->after('is_active');
        });

        Schema::table('email_notifications', function (Blueprint $table): void {
            $table->foreignId('user_id')->nullable()->after('payment_id')->constrained()->nullOnDelete();
            $table->string('recipient_scope', 20)->default('guest')->after('status')->index();
        });
    }

    public function down(): void
    {
        Schema::table('email_notifications', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('recipient_scope');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('receives_internal_email_notifications');
        });
    }
};
