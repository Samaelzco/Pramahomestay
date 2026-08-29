<?php

namespace App\Jobs;

use App\Contracts\Services\EmailNotificationServiceInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class SendGuestEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 60;

    public function __construct(public readonly int $notificationId)
    {
        $this->onQueue('emails');
        $this->afterCommit();
    }

    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(EmailNotificationServiceInterface $notifications): void
    {
        $notifications->send($this->notificationId);
    }

    public function failed(?Throwable $exception): void
    {
        app(EmailNotificationServiceInterface::class)->markFailed($this->notificationId, $exception?->getMessage() ?? 'Pengiriman email gagal.');
    }
}
