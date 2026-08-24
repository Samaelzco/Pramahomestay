<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            $table->text('description_en')->nullable()->after('description');
        });

        Schema::table('amenities', function (Blueprint $table): void {
            $table->string('name_en', 100)->nullable()->after('name');
            $table->string('description_en', 500)->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('amenities', function (Blueprint $table): void {
            $table->dropColumn(['name_en', 'description_en']);
        });

        Schema::table('rooms', function (Blueprint $table): void {
            $table->dropColumn('description_en');
        });
    }
};
