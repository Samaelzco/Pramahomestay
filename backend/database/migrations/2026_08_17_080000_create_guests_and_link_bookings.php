<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table): void {
            $table->id();
            $table->string('full_name', 120)->index();
            $table->string('email')->unique();
            $table->string('phone', 30)->index();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('bookings', function (Blueprint $table): void {
            $table->foreignId('guest_id')->nullable()->after('room_id')->constrained('guests')->restrictOnDelete();
        });

        $guestIds = [];
        DB::table('bookings')->orderBy('id')->chunkById(100, function ($bookings) use (&$guestIds): void {
            foreach ($bookings as $booking) {
                $email = mb_strtolower(trim((string) $booking->guest_email));
                if (! isset($guestIds[$email])) {
                    $existing = DB::table('guests')->where('email', $email)->value('id');
                    $guestIds[$email] = $existing ?: DB::table('guests')->insertGetId([
                        'full_name' => $booking->guest_name,
                        'email' => $email,
                        'phone' => $booking->guest_phone,
                        'created_by' => $booking->created_by,
                        'created_at' => $booking->created_at,
                        'updated_at' => $booking->updated_at,
                    ]);
                }

                DB::table('bookings')->where('id', $booking->id)->update(['guest_id' => $guestIds[$email]]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('guest_id');
        });
        Schema::dropIfExists('guests');
    }
};
