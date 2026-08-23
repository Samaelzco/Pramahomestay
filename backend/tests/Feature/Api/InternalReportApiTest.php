<?php

namespace Tests\Feature\Api;

use App\Enums\BookingStatus;
use App\Enums\PaymentMethod;
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

class InternalReportApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        CarbonImmutable::setTestNow('2026-08-23 10:00:00');
        $this->seed(AuthorizationSeeder::class);
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public function test_reports_require_authentication_and_permission(): void
    {
        $this->getJson('/api/internal/reports')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/internal/reports')->assertForbidden();
    }

    public function test_report_returns_metrics_comparison_rooms_and_transactions(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);
        $room = Room::factory()->create(['name' => 'Unit 101', 'is_active' => true]);
        $booking = Booking::factory()->for($room)->create([
            'status' => BookingStatus::CheckedOut,
            'check_in' => '2026-08-10', 'check_out' => '2026-08-13',
            'total_amount' => 1950000, 'created_at' => '2026-08-02 09:00:00',
        ]);
        Payment::factory()->for($booking)->create([
            'status' => PaymentStatus::Paid, 'method' => PaymentMethod::BankTransfer,
            'amount_paid' => 1950000, 'paid_at' => '2026-08-04 10:00:00', 'created_at' => '2026-08-04 10:00:00',
        ]);

        $this->getJson('/api/internal/reports?date_from=2026-08-01&date_to=2026-08-15')
            ->assertOk()
            ->assertJsonPath('data.period.days', 15)
            ->assertJsonPath('data.metrics.revenue', '1950000.00')
            ->assertJsonPath('data.metrics.bookings', 1)
            ->assertJsonPath('data.metrics.occupied_nights', 3)
            ->assertJsonPath('data.rooms.0.name', 'Unit 101')
            ->assertJsonPath('data.rooms.0.occupancy_rate', 20)
            ->assertJsonPath('data.payment_methods.1.amount', '1950000.00')
            ->assertJsonCount(1, 'data.transactions');
    }

    public function test_csv_and_pdf_exports_are_downloadable_and_audited(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);

        $this->get('/api/internal/reports/export?format=csv&date_from=2026-08-01&date_to=2026-08-23')
            ->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $pdf = $this->get('/api/internal/reports/export?format=pdf&date_from=2026-08-01&date_to=2026-08-23')
            ->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $pdf->getContent());
        $this->assertDatabaseCount('audit_logs', 2);
        $this->assertDatabaseHas('audit_logs', ['module' => 'reports', 'action' => 'exported']);
    }

    public function test_report_validates_date_range_and_export_format(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['internal']);

        $this->getJson('/api/internal/reports?date_from=2026-08-23&date_to=2026-08-01')->assertUnprocessable()->assertJsonValidationErrors('date_to');
        $this->getJson('/api/internal/reports/export?format=xlsx')->assertUnprocessable()->assertJsonValidationErrors('format');
    }
}
