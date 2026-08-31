<?php

namespace Tests\Feature\Api;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public function test_dashboard_requires_authentication_and_permission(): void
    {
        $this->seed(AuthorizationSeeder::class);
        $this->getJson('/api/internal/dashboard')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/internal/dashboard')->assertForbidden();
    }

    public function test_dashboard_returns_operational_and_analytics_summary(): void
    {
        CarbonImmutable::setTestNow('2026-08-16 09:00:00');
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);

        $roomOne = Room::factory()->create(['is_active' => true]);
        Room::factory()->create(['is_active' => true]);
        $booking = Booking::factory()->for($roomOne)->create([
            'status' => BookingStatus::CheckedIn,
            'check_in' => '2026-08-16',
            'check_out' => '2026-08-18',
            'total_amount' => 2000000,
            'created_at' => '2026-08-15 10:00:00',
        ]);
        Payment::factory()->for($booking)->create([
            'status' => PaymentStatus::Partial,
            'amount_paid' => 750000,
            'paid_at' => '2026-08-16 08:00:00',
        ]);

        $this->getJson('/api/internal/dashboard?days=7')
            ->assertOk()
            ->assertJsonPath('data.period.days', 7)
            ->assertJsonPath('data.period.granularity', 'day')
            ->assertJsonPath('data.period.is_custom', false)
            ->assertJsonPath('data.operations.date', '2026-08-16')
            ->assertJsonPath('data.metrics.bookings', 1)
            ->assertJsonPath('data.metrics.revenue', '750000.00')
            ->assertJsonPath('data.metrics.occupancy_rate', 50)
            ->assertJsonPath('data.metrics.outstanding', '1250000.00')
            ->assertJsonPath('data.metrics.arrivals_today', 1)
            ->assertJsonCount(7, 'data.series')
            ->assertJsonCount(1, 'data.operations.arrivals')
            ->assertJsonCount(1, 'data.payment_followups');
    }

    public function test_dashboard_validates_supported_periods(): void
    {
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);

        $this->getJson('/api/internal/dashboard?days=14')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('days');
    }

    public function test_dashboard_accepts_an_unbounded_custom_range_and_adapts_its_granularity(): void
    {
        CarbonImmutable::setTestNow('2026-08-16 09:00:00');
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);

        $this->getJson('/api/internal/dashboard?from=2026-08-01&to=2026-08-16')
            ->assertOk()
            ->assertJsonPath('data.period.days', null)
            ->assertJsonPath('data.period.is_custom', true)
            ->assertJsonPath('data.period.granularity', 'day')
            ->assertJsonCount(16, 'data.series');

        $this->getJson('/api/internal/dashboard?from=2026-01-01&to=2026-05-01')
            ->assertOk()
            ->assertJsonPath('data.period.granularity', 'week')
            ->assertJsonCount(18, 'data.series');

        $this->getJson('/api/internal/dashboard?from=2023-01-01&to=2026-01-02')
            ->assertOk()
            ->assertJsonPath('data.period.granularity', 'month')
            ->assertJsonCount(37, 'data.series');
    }

    public function test_dashboard_validates_custom_range_boundaries(): void
    {
        $this->seed(AuthorizationSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);

        $this->getJson('/api/internal/dashboard?from=2026-08-01')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('to');

        $this->getJson('/api/internal/dashboard?from=2026-08-16&to=2026-08-01')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('to');

        $this->getJson('/api/internal/dashboard?days=30&from=2026-08-01&to=2026-08-16')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['days', 'from', 'to']);
    }
}
