<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\InternalNotificationServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\InternalNotifications\IndexInternalNotificationRequest;
use App\Http\Resources\InternalNotificationResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InternalNotificationController extends Controller
{
    public function __construct(private readonly InternalNotificationServiceInterface $notifications) {}

    public function index(IndexInternalNotificationRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);
        unset($validated['per_page'], $validated['page']);
        /** @var User $user */
        $user = $request->user();

        return InternalNotificationResource::collection($this->notifications->paginate($user, $validated, $perPage))
            ->additional([
                'unread_count' => $this->notifications->unreadCount($user),
                'timezone' => $this->notifications->timezone(),
            ]);
    }

    public function summary(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $summary = $this->notifications->summary($user);

        return response()->json([
            'data' => [
                'unread_count' => $summary['unread_count'],
                'notifications' => InternalNotificationResource::collection($summary['notifications'])->resolve($request),
                'timezone' => $summary['timezone'],
            ],
        ]);
    }

    public function read(Request $request, int $notification): InternalNotificationResource
    {
        /** @var User $user */
        $user = $request->user();

        return new InternalNotificationResource($this->notifications->markRead($user, $notification));
    }

    public function readAll(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'message' => 'Semua notifikasi telah ditandai dibaca.',
            'updated' => $this->notifications->markAllRead($user),
        ]);
    }
}
