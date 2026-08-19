<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalPaymentApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AuthorizationSeeder::class);
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        $this->booking = Booking::factory()->for(Room::factory())->create([
            'guest_name' => 'Ayu Lestari',
            'total_amount' => 1800000,
            'price_per_night' => 600000,
            'total_nights' => 3,
        ]);
    }

    public function test_payment_endpoints_require_authentication_and_permission(): void
    {
        $this->getJson('/api/internal/payments')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/internal/payments')->assertForbidden();
    }

    public function test_authorized_user_can_create_filter_view_and_update_payment(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $created = $this->postJson('/api/internal/payments', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.status', 'partial')
            ->assertJsonPath('data.remaining_amount', '800000.00');

        $id = $created->json('data.id');
        $this->assertStringStartsWith('PAY-', $created->json('data.payment_code'));

        $this->getJson('/api/internal/payments?status=partial&search=Ayu')
            ->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/internal/payments/{$id}")
            ->assertOk()->assertJsonPath('data.booking.id', $this->booking->id);

        $this->putJson("/api/internal/payments/{$id}", [
            ...$this->payload(),
            'amount_paid' => 1800000,
        ])->assertOk()
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonPath('data.remaining_amount', '0.00');
    }

    public function test_it_rejects_overpayment_and_duplicate_booking_payment(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);

        $this->postJson('/api/internal/payments', [
            ...$this->payload(),
            'amount_paid' => 1900000,
        ])->assertUnprocessable()->assertJsonValidationErrors('amount_paid');

        Payment::factory()->for($this->booking)->create();
        $this->postJson('/api/internal/payments', $this->payload())
            ->assertUnprocessable()->assertJsonValidationErrors('booking_id');
    }

    public function test_paid_or_partial_payment_can_be_marked_as_refunded_with_a_reason(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $payment = Payment::factory()->for($this->booking)->create([
            'status' => 'partial',
            'amount_paid' => 1000000,
            'notes' => 'Pembayaran awal.',
        ]);

        $this->patchJson("/api/internal/payments/{$payment->id}/refund", ['reason' => 'Booking dibatalkan tamu.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'refunded')
            ->assertJsonPath('data.credited_amount', '0.00');

        $this->assertStringContainsString('Alasan pengembalian: Booking dibatalkan tamu.', $payment->refresh()->notes);
    }

    public function test_refund_requires_a_reason_and_a_credited_payment(): void
    {
        Sanctum::actingAs($this->admin, ['internal']);
        $payment = Payment::factory()->for($this->booking)->create(['status' => 'unpaid', 'amount_paid' => 0]);

        $this->patchJson("/api/internal/payments/{$payment->id}/refund", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('reason');

        $this->patchJson("/api/internal/payments/{$payment->id}/refund", ['reason' => 'Koreksi transaksi.'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $paid = Payment::factory()->for(Booking::factory()->for(Room::factory()))->create(['status' => 'paid', 'amount_paid' => 100000]);
        $this->putJson("/api/internal/payments/{$paid->id}", [
            ...$this->payload(),
            'booking_id' => $paid->booking_id,
            'amount_paid' => 100000,
            'status' => 'refunded',
        ])->assertUnprocessable()->assertJsonValidationErrors('status');
    }

    public function test_authorized_user_can_upload_replace_and_remove_payment_proof(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->admin, ['internal']);
        $payload = $this->payload();
        $payload['proof'] = UploadedFile::fake()->image('receipt.jpg', 1000, 1400)->size(400);

        $created = $this->post('/api/internal/payments', $payload, ['Accept' => 'application/json'])
            ->assertCreated();
        $payment = Payment::query()->findOrFail($created->json('data.id'));
        $firstPath = $payment->proof_path;
        Storage::disk('public')->assertExists($firstPath);

        $replacement = $this->payload();
        $replacement['_method'] = 'PUT';
        $replacement['proof'] = UploadedFile::fake()->image('replacement.png', 1000, 1400)->size(500);
        $this->post("/api/internal/payments/{$payment->id}", $replacement, ['Accept' => 'application/json'])
            ->assertOk();

        $payment->refresh();
        $replacementPath = $payment->proof_path;
        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($replacementPath);

        $remove = $this->payload();
        $remove['_method'] = 'PUT';
        $remove['remove_proof'] = true;
        $this->post("/api/internal/payments/{$payment->id}", $remove, ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('data.proof_url', null);
        Storage::disk('public')->assertMissing($replacementPath);
    }

    private function payload(): array
    {
        return [
            'booking_id' => $this->booking->id,
            'amount_paid' => 1000000,
            'method' => 'bank_transfer',
            'status' => 'unpaid',
            'reference_number' => 'TRX-2026-001',
            'paid_at' => '2026-08-16T10:30:00+08:00',
            'notes' => 'Transfer diverifikasi staff.',
        ];
    }
}
