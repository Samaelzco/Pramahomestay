<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homestay_settings', function (Blueprint $table): void {
            $table->string('final_cta_image_path')->nullable()->after('hero_cycle_seconds');
            $table->string('final_cta_image_url')->nullable()->after('final_cta_image_path');
        });
    }

    public function down(): void
    {
        Schema::table('homestay_settings', function (Blueprint $table): void {
            $table->dropColumn(['final_cta_image_path', 'final_cta_image_url']);
        });
    }
};
