<?php

namespace App\Events;

use App\Models\InternalNotification;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InternalNotificationCreated implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly InternalNotification $notification) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("internal-users.{$this->notification->user_id}");
    }

    public function broadcastAs(): string
    {
        return 'internal.notification.created';
    }

    public function broadcastWith(): array
    {
        return [
            'notification' => [
                'id' => $this->notification->id,
                'type' => $this->notification->type->value,
                'title' => $this->notification->title,
                'title_en' => $this->notification->title_en,
                'message' => $this->notification->message,
                'message_en' => $this->notification->message_en,
                'action_url' => $this->notification->action_url,
                'is_read' => false,
                'read_at' => null,
                'created_at' => $this->notification->created_at?->toIso8601String(),
            ],
        ];
    }
}
