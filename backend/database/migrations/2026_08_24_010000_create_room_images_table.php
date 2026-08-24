<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->text('url');
            $table->string('path')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['room_id', 'sort_order']);
        });

        if (Schema::hasColumn('rooms', 'image_url')) {
            foreach (DB::table('rooms')->whereNotNull('image_url')->where('image_url', '<>', '')->get(['id', 'image_url', 'image_path']) as $room) {
                DB::table('room_images')->insert([
                    'room_id' => $room->id,
                    'url' => $room->image_url,
                    'path' => $room->image_path,
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        Schema::table('rooms', function (Blueprint $table): void {
            if (Schema::hasColumn('rooms', 'image_path')) {
                $table->dropColumn('image_path');
            }
            if (Schema::hasColumn('rooms', 'image_url')) {
                $table->dropColumn('image_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            $table->text('image_url')->nullable();
            $table->string('image_path')->nullable();
        });

        foreach (DB::table('rooms')->get(['id']) as $room) {
            $cover = DB::table('room_images')->where('room_id', $room->id)->orderBy('sort_order')->orderBy('id')->first();
            if ($cover) {
                DB::table('rooms')->where('id', $room->id)->update(['image_url' => $cover->url, 'image_path' => $cover->path]);
            }
        }

        Schema::dropIfExists('room_images');
    }
};
