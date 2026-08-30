<?php

namespace App\Console\Commands;

use App\Contracts\Services\InternalNotificationServiceInterface;
use Illuminate\Console\Command;

class QueueDailyInternalNotifications extends Command
{
    protected $signature = 'internal-notifications:queue-daily';

    protected $description = 'Create due check-in and check-out notifications for internal users';

    public function handle(InternalNotificationServiceInterface $notifications): int
    {
        $created = $notifications->queueDailyReminders();
        $this->info("{$created} internal notifications created.");

        return self::SUCCESS;
    }
}
