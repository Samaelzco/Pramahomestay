<?php

namespace Tests\Feature\Architecture;

use App\Contracts\Repositories\AccessRepositoryInterface;
use App\Contracts\Repositories\AmenityRepositoryInterface;
use App\Contracts\Repositories\AuditLogRepositoryInterface;
use App\Contracts\Repositories\AvailabilityRepositoryInterface;
use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\DashboardRepositoryInterface;
use App\Contracts\Repositories\EmailNotificationRepositoryInterface;
use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Repositories\InternalNotificationRepositoryInterface;
use App\Contracts\Repositories\OperationRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\AccessServiceInterface;
use App\Contracts\Services\AmenityServiceInterface;
use App\Contracts\Services\AuditLogServiceInterface;
use App\Contracts\Services\AvailabilityServiceInterface;
use App\Contracts\Services\BookingServiceInterface;
use App\Contracts\Services\DashboardServiceInterface;
use App\Contracts\Services\EmailNotificationServiceInterface;
use App\Contracts\Services\GuestServiceInterface;
use App\Contracts\Services\HomestaySettingServiceInterface;
use App\Contracts\Services\InternalNotificationServiceInterface;
use App\Contracts\Services\OperationServiceInterface;
use App\Contracts\Services\PaymentServiceInterface;
use App\Contracts\Services\RoomServiceInterface;
use App\Contracts\Services\UserServiceInterface;
use App\Repositories\Eloquent\AccessRepository;
use App\Repositories\Eloquent\AmenityRepository;
use App\Repositories\Eloquent\AuditLogRepository;
use App\Repositories\Eloquent\AvailabilityRepository;
use App\Repositories\Eloquent\BookingRepository;
use App\Repositories\Eloquent\DashboardRepository;
use App\Repositories\Eloquent\EmailNotificationRepository;
use App\Repositories\Eloquent\GuestRepository;
use App\Repositories\Eloquent\HomestaySettingRepository;
use App\Repositories\Eloquent\InternalNotificationRepository;
use App\Repositories\Eloquent\OperationRepository;
use App\Repositories\Eloquent\PaymentRepository;
use App\Repositories\Eloquent\RoomRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Services\AccessService;
use App\Services\AmenityService;
use App\Services\AuditLogService;
use App\Services\AvailabilityService;
use App\Services\BookingService;
use App\Services\DashboardService;
use App\Services\EmailNotificationService;
use App\Services\GuestService;
use App\Services\HomestaySettingService;
use App\Services\InternalNotificationService;
use App\Services\OperationService;
use App\Services\PaymentService;
use App\Services\RoomService;
use App\Services\UserService;
use Tests\TestCase;

class ServiceRepositoryArchitectureTest extends TestCase
{
    public function test_repository_and_service_contracts_resolve_to_their_implementations(): void
    {
        $this->assertInstanceOf(AccessRepository::class, $this->app->make(AccessRepositoryInterface::class));
        $this->assertInstanceOf(AmenityRepository::class, $this->app->make(AmenityRepositoryInterface::class));
        $this->assertInstanceOf(AvailabilityRepository::class, $this->app->make(AvailabilityRepositoryInterface::class));
        $this->assertInstanceOf(AmenityService::class, $this->app->make(AmenityServiceInterface::class));
        $this->assertInstanceOf(AvailabilityService::class, $this->app->make(AvailabilityServiceInterface::class));
        $this->assertInstanceOf(AccessService::class, $this->app->make(AccessServiceInterface::class));
        $this->assertInstanceOf(AuditLogRepository::class, $this->app->make(AuditLogRepositoryInterface::class));
        $this->assertInstanceOf(AuditLogService::class, $this->app->make(AuditLogServiceInterface::class));
        $this->assertInstanceOf(
            BookingRepository::class,
            $this->app->make(BookingRepositoryInterface::class),
        );

        $this->assertInstanceOf(
            BookingService::class,
            $this->app->make(BookingServiceInterface::class),
        );

        $this->assertInstanceOf(DashboardRepository::class, $this->app->make(DashboardRepositoryInterface::class));
        $this->assertInstanceOf(DashboardService::class, $this->app->make(DashboardServiceInterface::class));
        $this->assertInstanceOf(EmailNotificationRepository::class, $this->app->make(EmailNotificationRepositoryInterface::class));
        $this->assertInstanceOf(EmailNotificationService::class, $this->app->make(EmailNotificationServiceInterface::class));
        $this->assertInstanceOf(GuestRepository::class, $this->app->make(GuestRepositoryInterface::class));
        $this->assertInstanceOf(GuestService::class, $this->app->make(GuestServiceInterface::class));
        $this->assertInstanceOf(HomestaySettingRepository::class, $this->app->make(HomestaySettingRepositoryInterface::class));
        $this->assertInstanceOf(HomestaySettingService::class, $this->app->make(HomestaySettingServiceInterface::class));
        $this->assertInstanceOf(InternalNotificationRepository::class, $this->app->make(InternalNotificationRepositoryInterface::class));
        $this->assertInstanceOf(InternalNotificationService::class, $this->app->make(InternalNotificationServiceInterface::class));
        $this->assertInstanceOf(OperationRepository::class, $this->app->make(OperationRepositoryInterface::class));
        $this->assertInstanceOf(OperationService::class, $this->app->make(OperationServiceInterface::class));

        $this->assertInstanceOf(
            PaymentRepository::class,
            $this->app->make(PaymentRepositoryInterface::class),
        );

        $this->assertInstanceOf(
            PaymentService::class,
            $this->app->make(PaymentServiceInterface::class),
        );

        $this->assertInstanceOf(
            RoomRepository::class,
            $this->app->make(RoomRepositoryInterface::class),
        );

        $this->assertInstanceOf(
            RoomService::class,
            $this->app->make(RoomServiceInterface::class),
        );

        $this->assertInstanceOf(
            UserRepository::class,
            $this->app->make(UserRepositoryInterface::class),
        );

        $this->assertInstanceOf(
            UserService::class,
            $this->app->make(UserServiceInterface::class),
        );
    }
}
