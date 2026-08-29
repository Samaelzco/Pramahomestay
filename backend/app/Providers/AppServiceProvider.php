<?php

namespace App\Providers;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\HomestaySetting;
use App\Models\Payment;
use App\Models\Room;
use App\Models\RoomBlock;
use App\Observers\AuditObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', fn (Request $request): Limit => Limit::perMinute(5)->by(mb_strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('public-bookings', fn (Request $request): Limit => Limit::perMinute(5)->by((string) $request->ip()));
        RateLimiter::for('public-booking-recovery', fn (Request $request): array => [
            Limit::perMinute(5)->by('minute|'.mb_strtolower((string) $request->input('booking_code')).'|'.$request->ip()),
            Limit::perHour(20)->by('hour|'.$request->ip()),
        ]);
        RateLimiter::for('public-payments', fn (Request $request): Limit => Limit::perMinute(10)->by((string) $request->ip()));

        foreach ([Room::class, RoomBlock::class, Amenity::class, Booking::class, Payment::class, Guest::class, HomestaySetting::class] as $model) {
            $model::observe(AuditObserver::class);
        }
    }
}
