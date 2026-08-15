<?php

namespace App\Providers;

use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\RoomServiceInterface;
use App\Contracts\Services\UserServiceInterface;
use App\Repositories\Eloquent\RoomRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Services\RoomService;
use App\Services\UserService;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(RoomRepositoryInterface::class, RoomRepository::class);
        $this->app->bind(RoomServiceInterface::class, RoomService::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);
    }
}
