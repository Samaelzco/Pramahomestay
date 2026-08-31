"use client";

import { rejectPaymentAction, verifyPaymentAction } from "@/app/internal/(dashboard)/payments/actions";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { localize, useLocale } from "@/lib/locale";

export function PaymentReviewActions({ id, paymentCode, amountLabel }: { id: number; paymentCode: string; amountLabel: string }) {
  const locale = useLocale();

  return (
    <section className="mt-8 grid gap-6 rounded-lg bg-secondary-soft p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-[-0.02em]">
          {localize(locale, "Bukti pembayaran menunggu keputusan", "Payment receipt awaiting review")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {localize(
            locale,
            `Cocokkan bukti ${paymentCode} dengan nominal ${amountLabel}. Verifikasi akan mengakui pembayaran dan mengonfirmasi booking jika lunas.`,
            `Match receipt ${paymentCode} against ${amountLabel}. Verification will credit the payment and confirm the booking when fully paid.`,
          )}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
        <ConfirmAction
          action={rejectPaymentAction.bind(null, id)}
          trigger={localize(locale, "Tolak bukti", "Reject receipt")}
          title={localize(locale, `Tolak bukti ${paymentCode}?`, `Reject receipt ${paymentCode}?`)}
          description={localize(locale, "Pembayaran tidak akan diakui. Foto bukti tetap tersimpan dan pelanggan dapat mengirim bukti pengganti.", "The payment will not be credited. The receipt remains stored and the guest can submit a replacement.")}
          confirmLabel={localize(locale, "Ya, tolak bukti", "Yes, reject receipt")}
          triggerVariant="danger-outline"
          reason={{ label: localize(locale, "Alasan penolakan", "Rejection reason"), required: true, placeholder: localize(locale, "Contoh: nominal atau rekening tujuan tidak sesuai", "Example: amount or destination account does not match") }}
        />
        <ConfirmAction
          action={verifyPaymentAction.bind(null, id)}
          trigger={localize(locale, "Verifikasi pembayaran", "Verify payment")}
          title={localize(locale, `Verifikasi ${paymentCode}?`, `Verify ${paymentCode}?`)}
          description={localize(locale, `Pastikan bukti dan nominal ${amountLabel} sudah sesuai. Keputusan ini akan mencatat pembayaran sebagai pendapatan.`, `Make sure the receipt and ${amountLabel} amount match. This decision will record the payment as revenue.`)}
          confirmLabel={localize(locale, "Ya, verifikasi", "Yes, verify")}
          tone="primary"
          triggerVariant="primary"
        />
      </div>
    </section>
  );
}
