<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\PaymentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payments\IndexPaymentRequest;
use App\Http\Requests\Payments\RefundPaymentRequest;
use App\Http\Requests\Payments\StorePaymentRequest;
use App\Http\Requests\Payments\UpdatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentServiceInterface $payments) {}

    public function index(IndexPaymentRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);
        unset($validated['per_page'], $validated['page']);

        return PaymentResource::collection($this->payments->paginate($validated, $perPage));
    }

    public function store(StorePaymentRequest $request): PaymentResource
    {
        $payment = $this->payments->create($request->validated(), $request->user()?->id);

        return (new PaymentResource($payment))->additional(['message' => 'Pembayaran berhasil ditambahkan.']);
    }

    public function show(Payment $payment): PaymentResource
    {
        return new PaymentResource($payment->load('booking.room'));
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): PaymentResource
    {
        $payment = $this->payments->update($payment, $request->validated());

        return (new PaymentResource($payment))->additional(['message' => 'Pembayaran berhasil diperbarui.']);
    }

    public function refund(RefundPaymentRequest $request, Payment $payment): PaymentResource
    {
        $payment = $this->payments->refund($payment, $request->validated('reason'));

        return (new PaymentResource($payment))->additional(['message' => 'Pembayaran berhasil ditandai dikembalikan.']);
    }
}
