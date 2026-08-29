<?php

namespace App\Services;

use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Services\PaymentServiceInterface;
use App\Enums\BookingStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Booking;
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
        private readonly HomestaySettingRepositoryInterface $settings,
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

                $payment = $this->payments->create($attributes);
                $this->confirmBookingWhenPaid($booking, $payment);

                return $payment;
            });
        } catch (Throwable $exception) {
            $this->deleteProof($proofPath);
            throw $exception;
        }
    }

    public function findForBooking(int $bookingId): ?Payment
    {
        return $this->payments->findByBookingId($bookingId);
    }

    public function submitPublicProof(Booking $booking, array $attributes): Payment
    {
        $proof = $this->extractProof($attributes);
        if (! $proof) {
            throw ValidationException::withMessages(['proof' => 'Pilih bukti pembayaran untuk diunggah.']);
        }

        if ($booking->status === BookingStatus::Cancelled) {
            throw ValidationException::withMessages(['booking' => 'Booking ini sudah dibatalkan.']);
        }
        if ($booking->payment_due_at?->isPast()) {
            throw ValidationException::withMessages(['booking' => 'Batas waktu pembayaran telah berakhir. Hubungi pengelola untuk bantuan.']);
        }

        $proofPath = $this->storeProof($proof);
        $oldProofPath = null;

        try {
            $payment = DB::transaction(function () use ($booking, $attributes, $proofPath, &$oldProofPath): Payment {
                $lockedBooking = $this->bookings->findForUpdate($booking->id);
                $existing = $this->payments->findByBookingForUpdate($booking->id);

                if ($existing && ! in_array($existing->status, [PaymentStatus::Unpaid, PaymentStatus::Failed], true)) {
                    throw ValidationException::withMessages(['proof' => 'Bukti pembayaran sudah dikirim dan sedang diproses.']);
                }

                $values = [
                    'booking_id' => $lockedBooking->id,
                    'amount_paid' => $lockedBooking->total_amount,
                    'method' => PaymentMethod::BankTransfer->value,
                    'status' => PaymentStatus::PendingVerification->value,
                    'reference_number' => $attributes['reference_number'] ?? null,
                    'paid_at' => now(),
                    'proof_path' => $proofPath,
                    'proof_url' => Storage::disk('public')->url($proofPath),
                    'created_by' => null,
                ];

                if ($existing) {
                    $oldProofPath = $existing->proof_path;

                    return $this->payments->update($existing, $values);
                }

                $values['payment_code'] = $this->uniqueCode();

                return $this->payments->create($values);
            });
        } catch (Throwable $exception) {
            $this->deleteProof($proofPath);
            throw $exception;
        }

        if ($oldProofPath && $oldProofPath !== $proofPath) {
            $this->deleteProof($oldProofPath);
        }

        return $payment;
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
                $payment = $this->payments->findForUpdate($payment->id);
                $booking = $this->bookings->findForUpdate((int) $attributes['booking_id']);

                if ($this->payments->existsForBooking($booking->id, $payment->id)) {
                    throw ValidationException::withMessages(['booking_id' => 'Booking ini sudah memiliki data pembayaran lain.']);
                }

                $attributes = $this->prepareAttributes($attributes, (string) $booking->total_amount, $payment->status === PaymentStatus::Refunded);
                if ($newProofPath) {
                    $this->applyProof($attributes, $newProofPath);
                } elseif ($removeProof) {
                    $attributes['proof_path'] = null;
                    $attributes['proof_url'] = null;
                }

                $updated = $this->payments->update($payment, $attributes);
                $this->confirmBookingWhenPaid($booking, $updated);

                return $updated;
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

    public function verify(Payment $payment): Payment
    {
        return DB::transaction(function () use ($payment): Payment {
            $locked = $this->payments->findForUpdate($payment->id);

            if ($locked->status !== PaymentStatus::PendingVerification) {
                throw ValidationException::withMessages(['status' => 'Hanya pembayaran yang menunggu verifikasi yang dapat diverifikasi.']);
            }
            if (! $locked->proof_path) {
                throw ValidationException::withMessages(['proof' => 'Bukti pembayaran belum tersedia.']);
            }

            $booking = $this->bookings->findForUpdate($locked->booking_id);
            if ($booking->status === BookingStatus::Cancelled) {
                throw ValidationException::withMessages(['status' => 'Pembayaran untuk booking yang dibatalkan tidak dapat diverifikasi.']);
            }

            $amount = (string) $locked->amount_paid;
            if (bccomp($amount, '0', 2) !== 1) {
                throw ValidationException::withMessages(['amount_paid' => 'Nominal pembayaran harus lebih dari nol untuk diverifikasi.']);
            }

            $status = bccomp($amount, (string) $booking->total_amount, 2) === 0
                ? PaymentStatus::Paid
                : PaymentStatus::Partial;
            $updated = $this->payments->update($locked, ['status' => $status->value]);
            $this->confirmBookingWhenPaid($booking, $updated);

            return $updated;
        });
    }

    public function reject(Payment $payment, string $reason): Payment
    {
        return DB::transaction(function () use ($payment, $reason): Payment {
            $locked = $this->payments->findForUpdate($payment->id);

            if ($locked->status !== PaymentStatus::PendingVerification) {
                throw ValidationException::withMessages(['status' => 'Hanya pembayaran yang menunggu verifikasi yang dapat ditolak.']);
            }

            $entry = 'Alasan penolakan: '.trim($reason);

            return $this->payments->update($locked, [
                'status' => PaymentStatus::Failed->value,
                'notes' => trim(implode("\n\n", array_filter([$locked->notes, $entry]))),
            ]);
        });
    }

    public function refund(Payment $payment, string $reason): Payment
    {
        return DB::transaction(function () use ($payment, $reason): Payment {
            $locked = $this->payments->findForUpdate($payment->id);

            if ($locked->status === PaymentStatus::Refunded) {
                return $locked->load('booking.room');
            }

            if (! in_array($locked->status, [PaymentStatus::Partial, PaymentStatus::Paid], true)) {
                throw ValidationException::withMessages(['status' => 'Hanya pembayaran sebagian atau lunas yang dapat dikembalikan.']);
            }

            $entry = 'Alasan pengembalian: '.trim($reason);

            return $this->payments->update($locked, [
                'status' => PaymentStatus::Refunded->value,
                'notes' => trim(implode("\n\n", array_filter([$locked->notes, $entry]))),
            ]);
        });
    }

    private function prepareAttributes(array $attributes, string $total, bool $alreadyRefunded = false): array
    {
        $amount = (string) $attributes['amount_paid'];
        if (bccomp($amount, $total, 2) === 1) {
            throw ValidationException::withMessages(['amount_paid' => 'Nominal pembayaran tidak boleh melebihi total booking.']);
        }

        if (bccomp($amount, '0', 2) === 1 && empty($attributes['method'])) {
            throw ValidationException::withMessages(['method' => 'Pilih metode untuk pembayaran yang memiliki nominal.']);
        }

        $requested = PaymentStatus::from($attributes['status']);
        if ($requested === PaymentStatus::Refunded && ! $alreadyRefunded) {
            throw ValidationException::withMessages(['status' => 'Gunakan aksi Kembalikan dan sertakan alasan pengembalian.']);
        }
        if (! in_array($requested, [PaymentStatus::Failed, PaymentStatus::Refunded, PaymentStatus::PendingVerification], true)) {
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
        $prefix = $this->settings->current()->payment_code_prefix;
        do {
            $code = $prefix.'-'.now()->format('ym').'-'.Str::upper(Str::random(6));
        } while ($this->payments->codeExists($code));

        return $code;
    }

    private function confirmBookingWhenPaid(Booking $booking, Payment $payment): void
    {
        if ($payment->status === PaymentStatus::Paid && $booking->status === BookingStatus::Pending) {
            $this->bookings->update($booking, ['status' => BookingStatus::Confirmed->value]);
        }
    }
}
