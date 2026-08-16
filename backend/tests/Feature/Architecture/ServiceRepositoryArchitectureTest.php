<?php

namespace Tests\Feature\Architecture;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\BookingServiceInterface;
use App\Contracts\Services\PaymentServiceInterface;
use App\Contracts\Services\RoomServiceInterface;
use App\Contracts\Services\UserServiceInterface;
use App\Repositories\Eloquent\BookingRepository;
use App\Repositories\Eloquent\PaymentRepository;
use App\Repositories\Eloquent\RoomRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Services\BookingService;
use App\Services\PaymentService;
use App\Services\RoomService;
use App\Services\UserService;
use Tests\TestCase;

class ServiceRepositoryArchitectureTest extends TestCase
{
    public function test_repository_and_service_contracts_resolve_to_their_implementations(): void
    {
        $this->assertInstanceOf(
            BookingRepository::class,
            $this->app->make(BookingRepositoryInterface::class),
        );

        $this->assertInstanceOf(
            BookingService::class,
            $this->app->make(BookingServiceInterface::class),
        );

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
