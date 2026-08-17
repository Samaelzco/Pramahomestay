<?php

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', config('initial-admin.email'))->first();
        $rooms = Room::query()->orderBy('name')->get();

        if ($rooms->isEmpty()) {
            return;
        }

        $records = [
            ['code' => 'PRM-DEMO-001', 'room' => $rooms[0], 'name' => 'Ayu Lestari', 'email' => 'ayu@example.com', 'phone' => '+62 812 3456 7890', 'start' => 2, 'nights' => 3, 'status' => BookingStatus::Confirmed],
            ['code' => 'PRM-DEMO-002', 'room' => $rooms[$rooms->count() > 1 ? 1 : 0], 'name' => 'Made Pranata', 'email' => 'made@example.com', 'phone' => '+62 813 4567 8901', 'start' => 8, 'nights' => 2, 'status' => BookingStatus::Pending],
        ];

        foreach ($records as $record) {
            $price = (string) $record['room']->price_per_night;
            $guest = Guest::query()->updateOrCreate(
                ['email' => $record['email']],
                ['full_name' => $record['name'], 'phone' => $record['phone'], 'created_by' => $admin?->id],
            );
            Booking::query()->updateOrCreate(
                ['booking_code' => $record['code']],
                [
                    'room_id' => $record['room']->id,
                    'guest_id' => $guest->id,
                    'guest_name' => $record['name'],
                    'guest_email' => $record['email'],
                    'guest_phone' => $record['phone'],
                    'check_in' => today()->addDays($record['start']),
                    'check_out' => today()->addDays($record['start'] + $record['nights']),
                    'guest_count' => min(2, $record['room']->capacity),
                    'price_per_night' => $price,
                    'total_nights' => $record['nights'],
                    'total_amount' => bcmul($price, (string) $record['nights'], 2),
                    'status' => $record['status'],
                    'special_requests' => null,
                    'internal_notes' => 'Data contoh operasional.',
                    'created_by' => $admin?->id,
                ],
            );
        }
    }
}
