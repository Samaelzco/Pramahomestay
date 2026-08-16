import { PaymentStatus } from "@/components/payments/payment-status";
import type { Payment } from "@/lib/api/types";
import Link from "next/link";

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export function PaymentList({ payments }: { payments: Payment[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
      <div className="hidden grid-cols-[1.05fr_1.25fr_1fr_0.9fr_0.8fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid"><span>Pembayaran</span><span>Tamu &amp; booking</span><span>Metode</span><span>Dibayar</span><span>Sisa</span><span>Aksi</span></div>
      <div className="divide-y">
        {payments.map((payment) => (
          <article key={payment.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 lg:grid-cols-[1.05fr_1.25fr_1fr_0.9fr_0.8fr_auto] lg:items-center lg:px-6">
            <div><p className="text-sm font-semibold tabular-nums">{payment.payment_code}</p><div className="mt-2"><PaymentStatus status={payment.status} label={payment.status_label} /></div></div>
            <div><p className="font-semibold">{payment.booking.guest_name}</p><p className="mt-1 truncate text-sm text-muted">{payment.booking.booking_code} · {payment.booking.room.name}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Metode</p><p className="mt-1 text-sm font-medium lg:mt-0">{payment.method_label ?? "Belum ditentukan"}</p><p className="mt-1 truncate text-xs text-muted">{payment.reference_number ? `Ref. ${payment.reference_number}` : "Tanpa referensi"}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Dibayar</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{currency.format(Number(payment.amount_paid))}</p><p className="mt-1 text-xs text-muted">{payment.paid_at ? date.format(new Date(payment.paid_at)) : "Belum ada tanggal"}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Sisa</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{currency.format(Number(payment.remaining_amount))}</p><p className="mt-1 text-xs text-muted">Sisa tagihan</p></div>
            <Link href={`/internal/payments/${payment.id}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">Lihat detail</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
