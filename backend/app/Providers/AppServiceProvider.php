<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Guest;
use App\Models\HomestaySetting;
use App\Models\Payment;
use App\Models\Room;
use App\Observers\AuditObserver;
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
        foreach ([Room::class, Booking::class, Payment::class, Guest::class, HomestaySetting::class] as $model) {
            $model::observe(AuditObserver::class);
        }
    }
}
