<?php

namespace App\Providers;

use App\Contracts\Repositories\AccessRepositoryInterface;
use App\Contracts\Repositories\AuditLogRepositoryInterface;
use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\DashboardRepositoryInterface;
use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\AccessServiceInterface;
use App\Contracts\Services\AuditLogServiceInterface;
use App\Contracts\Services\BookingServiceInterface;
use App\Contracts\Services\DashboardServiceInterface;
use App\Contracts\Services\GuestServiceInterface;
use App\Contracts\Services\HomestaySettingServiceInterface;
use App\Contracts\Services\PaymentServiceInterface;
use App\Contracts\Services\RoomServiceInterface;
use App\Contracts\Services\UserServiceInterface;
use App\Repositories\Eloquent\AccessRepository;
use App\Repositories\Eloquent\AuditLogRepository;
use App\Repositories\Eloquent\BookingRepository;
use App\Repositories\Eloquent\DashboardRepository;
use App\Repositories\Eloquent\GuestRepository;
use App\Repositories\Eloquent\HomestaySettingRepository;
use App\Repositories\Eloquent\PaymentRepository;
use App\Repositories\Eloquent\RoomRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Services\AccessService;
use App\Services\AuditLogService;
use App\Services\BookingService;
use App\Services\DashboardService;
use App\Services\GuestService;
use App\Services\HomestaySettingService;
use App\Services\PaymentService;
use App\Services\RoomService;
use App\Services\UserService;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AccessRepositoryInterface::class, AccessRepository::class);
        $this->app->bind(AccessServiceInterface::class, AccessService::class);
        $this->app->bind(AuditLogRepositoryInterface::class, AuditLogRepository::class);
        $this->app->bind(AuditLogServiceInterface::class, AuditLogService::class);
        $this->app->bind(BookingRepositoryInterface::class, BookingRepository::class);
        $this->app->bind(BookingServiceInterface::class, BookingService::class);
        $this->app->bind(DashboardRepositoryInterface::class, DashboardRepository::class);
        $this->app->bind(DashboardServiceInterface::class, DashboardService::class);
        $this->app->bind(GuestRepositoryInterface::class, GuestRepository::class);
        $this->app->bind(GuestServiceInterface::class, GuestService::class);
        $this->app->bind(HomestaySettingRepositoryInterface::class, HomestaySettingRepository::class);
        $this->app->bind(HomestaySettingServiceInterface::class, HomestaySettingService::class);
        $this->app->bind(PaymentRepositoryInterface::class, PaymentRepository::class);
        $this->app->bind(PaymentServiceInterface::class, PaymentService::class);
        $this->app->bind(RoomRepositoryInterface::class, RoomRepository::class);
        $this->app->bind(RoomServiceInterface::class, RoomService::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);
    }
}
