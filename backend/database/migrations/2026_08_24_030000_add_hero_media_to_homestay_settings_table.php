<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homestay_settings', function (Blueprint $table): void {
            $table->string('hero_media_type', 16)->default('image')->after('logo_url');
            $table->json('hero_images')->nullable()->after('hero_media_type');
            $table->string('hero_video_path')->nullable()->after('hero_images');
            $table->string('hero_video_url', 2048)->nullable()->after('hero_video_path');
            $table->unsignedSmallInteger('hero_cycle_seconds')->default(6)->after('hero_video_url');
        });
    }

    public function down(): void
    {
        Schema::table('homestay_settings', function (Blueprint $table): void {
            $table->dropColumn(['hero_media_type', 'hero_images', 'hero_video_path', 'hero_video_url', 'hero_cycle_seconds']);
        });
    }
};
