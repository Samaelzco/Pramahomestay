<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\DashboardServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\IndexDashboardRequest;
use App\Http\Resources\DashboardResource;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardServiceInterface $dashboard) {}

    public function index(IndexDashboardRequest $request): DashboardResource
    {
        return new DashboardResource($this->dashboard->summary($request->validated()));
    }
}
