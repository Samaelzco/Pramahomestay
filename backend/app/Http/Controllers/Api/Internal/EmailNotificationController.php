<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\EmailNotificationServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\EmailNotifications\IndexEmailNotificationRequest;
use App\Http\Resources\EmailNotificationResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmailNotificationController extends Controller
{
    public function __construct(private readonly EmailNotificationServiceInterface $notifications) {}

    public function index(IndexEmailNotificationRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 20);
        unset($validated['per_page'], $validated['page']);

        return EmailNotificationResource::collection($this->notifications->paginate($validated, $perPage));
    }
}
