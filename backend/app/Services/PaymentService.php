<?php

namespace App\Services;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Services\PaymentServiceInterface;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class PaymentService implements PaymentServiceInterface
{
    public function __construct(
        private readonly PaymentRepositoryInterface $payments,
        private readonly BookingRepositoryInterface $bookings,
    ) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->payments->paginate($filters, $perPage);
    }

    public function create(array $attributes, ?int $createdBy = null): Payment
    {
        $proof = $this->extractProof($attributes);
        unset($attributes['remove_proof']);
        $proofPath = $proof ? $this->storeProof($proof) : null;

        try {
            return DB::transaction(function () use ($attributes, $createdBy, $proofPath): Payment {
                $booking = $this->bookings->findForUpdate((int) $attributes['booking_id']);

                if ($this->payments->existsForBooking($booking->id)) {
                    throw ValidationException::withMessages(['booking_id' => 'Booking ini sudah memiliki data pembayaran.']);
                }

                $attributes = $this->prepareAttributes($attributes, (string) $booking->total_amount);
                $attributes['payment_code'] = $this->uniqueCode();
                $attributes['created_by'] = $createdBy;
                $this->applyProof($attributes, $proofPath);

                return $this->payments->create($attributes);
            });
        } catch (Throwable $exception) {
            $this->deleteProof($proofPath);
            throw $exception;
        }
    }

    public function update(Payment $payment, array $attributes): Payment
    {
        $proof = $this->extractProof($attributes);
        $removeProof = (bool) ($attributes['remove_proof'] ?? false);
        unset($attributes['remove_proof']);
        $newProofPath = $proof ? $this->storeProof($proof) : null;
        $oldProofPath = $payment->proof_path;

        try {
            $updated = DB::transaction(function () use ($payment, $attributes, $newProofPath, $removeProof): Payment {
                $booking = $this->bookings->findForUpdate((int) $attributes['booking_id']);

                if ($this->payments->existsForBooking($booking->id, $payment->id)) {
                    throw ValidationException::withMessages(['booking_id' => 'Booking ini sudah memiliki data pembayaran lain.']);
                }

                $attributes = $this->prepareAttributes($attributes, (string) $booking->total_amount);
                if ($newProofPath) {
                    $this->applyProof($attributes, $newProofPath);
                } elseif ($removeProof) {
                    $attributes['proof_path'] = null;
                    $attributes['proof_url'] = null;
                }

                return $this->payments->update($payment, $attributes);
            });
        } catch (Throwable $exception) {
            $this->deleteProof($newProofPath);
            throw $exception;
        }

        if (($newProofPath || $removeProof) && $oldProofPath) {
            $this->deleteProof($oldProofPath);
        }

        return $updated;
    }

    private function prepareAttributes(array $attributes, string $total): array
    {
        $amount = (string) $attributes['amount_paid'];
        if (bccomp($amount, $total, 2) === 1) {
            throw ValidationException::withMessages(['amount_paid' => 'Nominal pembayaran tidak boleh melebihi total booking.']);
        }

        if (bccomp($amount, '0', 2) === 1 && empty($attributes['method'])) {
            throw ValidationException::withMessages(['method' => 'Pilih metode untuk pembayaran yang memiliki nominal.']);
        }

        $requested = PaymentStatus::from($attributes['status']);
        if (! in_array($requested, [PaymentStatus::Failed, PaymentStatus::Refunded], true)) {
            $attributes['status'] = match (bccomp($amount, '0', 2)) {
                0 => PaymentStatus::Unpaid->value,
                default => bccomp($amount, $total, 2) === 0
                    ? PaymentStatus::Paid->value
                    : PaymentStatus::Partial->value,
            };
        }

        if (bccomp($amount, '0', 2) === 0) {
            $attributes['method'] = null;
            $attributes['paid_at'] = null;
        } elseif (empty($attributes['paid_at'])) {
            $attributes['paid_at'] = now();
        }

        return $attributes;
    }

    private function extractProof(array &$attributes): ?UploadedFile
    {
        $proof = $attributes['proof'] ?? null;
        unset($attributes['proof']);

        return $proof instanceof UploadedFile ? $proof : null;
    }

    private function storeProof(UploadedFile $proof): string
    {
        $path = $proof->storePublicly('payment-proofs', 'public');
        if (! $path) {
            throw new RuntimeException('Bukti pembayaran gagal disimpan.');
        }

        return $path;
    }

    private function applyProof(array &$attributes, ?string $path): void
    {
        if ($path) {
            $attributes['proof_path'] = $path;
            $attributes['proof_url'] = Storage::disk('public')->url($path);
        }
    }

    private function deleteProof(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }

    private function uniqueCode(): string
    {
        do {
            $code = 'PAY-'.now()->format('ym').'-'.Str::upper(Str::random(6));
        } while ($this->payments->codeExists($code));

        return $code;
    }
}
