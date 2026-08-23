<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('amenities', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('description', 500)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('amenity_room', function (Blueprint $table): void {
            $table->foreignId('amenity_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->primary(['amenity_id', 'room_id']);
        });

        if (Schema::hasColumn('rooms', 'amenities')) {
            foreach (DB::table('rooms')->select(['id', 'amenities'])->get() as $room) {
                $names = json_decode((string) $room->amenities, true) ?: [];
                foreach ($names as $name) {
                    $name = trim((string) $name);
                    if ($name === '') {
                        continue;
                    }
                    $amenityId = DB::table('amenities')->where('name', $name)->value('id');
                    if (! $amenityId) {
                        $baseSlug = Str::slug($name) ?: 'fasilitas';
                        $slug = $baseSlug;
                        $suffix = 2;
                        while (DB::table('amenities')->where('slug', $slug)->exists()) {
                            $slug = "{$baseSlug}-{$suffix}";
                            $suffix++;
                        }
                        $amenityId = DB::table('amenities')->insertGetId([
                            'name' => $name, 'slug' => $slug, 'is_active' => true,
                            'created_at' => now(), 'updated_at' => now(),
                        ]);
                    }
                    DB::table('amenity_room')->insertOrIgnore(['amenity_id' => $amenityId, 'room_id' => $room->id]);
                }
            }
        }

        Schema::table('rooms', function (Blueprint $table): void {
            if (Schema::hasColumn('rooms', 'size_sqm')) {
                $table->dropColumn('size_sqm');
            }
            if (Schema::hasColumn('rooms', 'amenities')) {
                $table->dropColumn('amenities');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            $table->decimal('size_sqm', 8, 2)->nullable();
            $table->json('amenities')->nullable();
        });

        foreach (DB::table('rooms')->select('id')->get() as $room) {
            $names = DB::table('amenities')->join('amenity_room', 'amenities.id', '=', 'amenity_room.amenity_id')
                ->where('amenity_room.room_id', $room->id)->orderBy('amenities.name')->pluck('amenities.name')->all();
            DB::table('rooms')->where('id', $room->id)->update(['amenities' => json_encode($names)]);
        }

        Schema::dropIfExists('amenity_room');
        Schema::dropIfExists('amenities');
    }
};
