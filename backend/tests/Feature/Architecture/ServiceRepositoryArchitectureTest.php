<?php

namespace Tests\Feature\Architecture;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\UserServiceInterface;
use App\Repositories\Eloquent\UserRepository;
use App\Services\UserService;
use Tests\TestCase;

class ServiceRepositoryArchitectureTest extends TestCase
{
    public function test_repository_and_service_contracts_resolve_to_their_implementations(): void
    {
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
