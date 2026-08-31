"use client";

import { refundPaymentAction } from "@/app/internal/(dashboard)/payments/actions";
import { PaymentStatus } from "@/components/payments/payment-status";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { Payment } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";
import Link from "next/link";

export function PaymentList({ payments }: { payments: Payment[] }) {
  const locale = useLocale();
  const currency = new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const methodLabels: Record<string, string> = { cash: "Cash", bank_transfer: "Bank transfer", qris: "QRIS", card: "Card" };
  return (
    <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
      <div className="hidden grid-cols-[1.05fr_1.25fr_1fr_0.9fr_0.8fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid"><span>{localize(locale, "Pembayaran", "Payment")}</span><span>{localize(locale, "Tamu & booking", "Guest & booking")}</span><span>{localize(locale, "Metode", "Method")}</span><span>{localize(locale, "Dibayar", "Paid")}</span><span>{localize(locale, "Sisa", "Balance")}</span><span>{localize(locale, "Aksi", "Actions")}</span></div>
      <div className="divide-y">
        {payments.map((payment) => (
          <article key={payment.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 lg:grid-cols-[1.05fr_1.25fr_1fr_0.9fr_0.8fr_auto] lg:items-center lg:px-6">
            <div><p className="text-sm font-semibold tabular-nums">{payment.payment_code}</p><div className="mt-2"><PaymentStatus status={payment.status} label={payment.status_label} /></div></div>
            <div><p className="font-semibold">{payment.booking.guest_name}</p><p className="mt-1 truncate text-sm text-muted">{payment.booking.booking_code} · {payment.booking.room.name}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Metode", "Method")}</p><p className="mt-1 text-sm font-medium lg:mt-0">{locale === "en" && payment.method ? methodLabels[payment.method] : payment.method_label ?? localize(locale, "Belum ditentukan", "Not specified")}</p><p className="mt-1 truncate text-xs text-muted">{payment.reference_number ? `Ref. ${payment.reference_number}` : localize(locale, "Tanpa referensi", "No reference")}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Dibayar", "Paid")}</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{currency.format(Number(payment.amount_paid))}</p><p className="mt-1 text-xs text-muted">{payment.paid_at ? date.format(new Date(payment.paid_at)) : localize(locale, "Belum ada tanggal", "No date")}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Sisa", "Balance")}</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{currency.format(Number(payment.remaining_amount))}</p><p className="mt-1 text-xs text-muted">{localize(locale, "Sisa tagihan", "Outstanding balance")}</p></div>
            <div className="flex flex-wrap items-center gap-x-4 lg:flex-col lg:items-start">
              <Link href={`/internal/payments/${payment.id}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">{localize(locale, "Lihat detail", "View details")}</Link>
              {payment.can_update && ["partial", "paid"].includes(payment.status) && <ConfirmAction action={refundPaymentAction.bind(null, payment.id)} trigger={localize(locale, "Kembalikan", "Refund")} title={localize(locale, `Kembalikan ${payment.payment_code}?`, `Refund ${payment.payment_code}?`)} description={localize(locale, "Nominal tidak dihapus, tetapi tidak lagi dihitung sebagai pembayaran masuk. Aksi dan alasannya tetap tersimpan pada transaksi.", "The amount remains recorded but will no longer count as an incoming payment. The action and reason stay in the transaction history.")} confirmLabel={localize(locale, "Catat pengembalian", "Record refund")} reason={{ label: localize(locale, "Alasan pengembalian", "Refund reason"), required: true, placeholder: localize(locale, "Contoh: booking dibatalkan oleh tamu", "Example: guest cancelled the booking") }} />}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
