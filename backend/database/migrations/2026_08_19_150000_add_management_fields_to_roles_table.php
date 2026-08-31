<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table): void {
            $table->string('display_name', 100)->nullable()->index()->after('name');
            $table->string('description', 500)->nullable()->after('display_name');
            $table->boolean('is_protected')->default(false)->index()->after('description');
        });

        DB::table('roles')->where('name', 'admin')->update([
            'display_name' => 'Administrator',
            'description' => 'Akses penuh ke seluruh fitur internal dan pengaturan sistem.',
            'is_protected' => true,
        ]);
        DB::table('roles')->where('name', 'staff')->update([
            'display_name' => 'Staff',
            'description' => 'Akses operasional harian sesuai permission yang dipilih.',
        ]);
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table): void {
            $table->dropIndex(['display_name']);
            $table->dropIndex(['is_protected']);
            $table->dropColumn(['display_name', 'description', 'is_protected']);
        });
    }
};
