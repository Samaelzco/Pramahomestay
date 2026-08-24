"use client";

import { createPaymentAction, updatePaymentAction } from "@/app/internal/(dashboard)/payments/actions";
import { PaymentProofInput } from "@/components/payments/payment-proof-input";
import type { ActionState, Booking, Payment } from "@/lib/api/types";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import Link from "next/link";
import { useActionState, useState } from "react";

function FieldError({ errors }: { errors?: string[] }) { const locale = useLocale(); return errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>); }

export function PaymentForm({ bookings, payment }: { bookings: Booking[]; payment?: Payment }) {
  const locale = useLocale();
  const currency = new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  const methods = [["", localize(locale, "Belum ditentukan", "Not specified")], ["cash", localize(locale, "Tunai", "Cash")], ["bank_transfer", localize(locale, "Transfer bank", "Bank transfer")], ["qris", "QRIS"], ["card", localize(locale, "Kartu", "Card")]];
  const action = payment ? updatePaymentAction.bind(null, payment.id) : createPaymentAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const [bookingId, setBookingId] = useState(String(payment?.booking.id ?? bookings[0]?.id ?? ""));
  const [amount, setAmount] = useState(payment?.amount_paid ?? "0");
  const [handling, setHandling] = useState(payment && ["failed", "refunded"].includes(payment.status) ? payment.status : "normal");
  const booking = bookings.find((item) => String(item.id) === bookingId) ?? payment?.booking;
  const bill = Number(booking?.total_amount ?? 0);
  const numericAmount = Math.max(0, Number(amount) || 0);
  const credited = handling === "normal" ? Math.min(numericAmount, bill) : 0;
  const remaining = Math.max(0, bill - credited);
  const paidAt = payment?.paid_at ? payment.paid_at.slice(0, 16) : "";
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return <form action={formAction} className="mt-10 max-w-5xl">
    {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</div>}
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Tagihan booking", "Booking charge")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Pilih reservasi dan catat nominal pembayaran yang diterima.", "Choose a reservation and record the amount received.")}</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">Booking<select name="booking_id" required value={bookingId} disabled={Boolean(payment)} onChange={(event) => setBookingId(event.target.value)} className={inputClass}>{bookings.map((item) => <option key={item.id} value={item.id}>{item.booking_code} · {item.guest_name} · {item.room.name}</option>)}</select>{payment && <input type="hidden" name="booking_id" value={bookingId} />}<FieldError errors={state.errors?.booking_id} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Nominal dibayar", "Amount paid")}<input name="amount_paid" type="number" min="0" max={bill || undefined} step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} /><FieldError errors={state.errors?.amount_paid} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Metode pembayaran", "Payment method")}<select name="method" defaultValue={payment?.method ?? ""} className={inputClass}>{methods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><FieldError errors={state.errors?.method} /></label>
      <div key={`${bookingId}-${amount}-${handling}`} className="booking-estimate-feedback grid gap-3 rounded-lg bg-primary p-5 text-white sm:col-span-2 sm:grid-cols-3 sm:p-6"><div><p className="text-xs text-white/65">{localize(locale, "Total tagihan", "Total charge")}</p><p className="mt-1 font-semibold tabular-nums">{currency.format(bill)}</p></div><div><p className="text-xs text-white/65">{localize(locale, "Diakui dibayar", "Credited payment")}</p><p className="mt-1 font-semibold tabular-nums">{currency.format(credited)}</p></div><div><p className="text-xs text-white/65">{localize(locale, "Sisa tagihan", "Outstanding balance")}</p><p className="mt-1 text-lg font-semibold tabular-nums">{currency.format(remaining)}</p></div></div>
    </div></section>
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Rincian transaksi", "Transaction details")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Tambahkan waktu, referensi, dan kondisi khusus jika diperlukan.", "Add a time, reference, and special handling when needed.")}</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Tanggal pembayaran · TT/BB/TTTT JJ:MM", "Payment date · MM/DD/YYYY HH:MM")}<input name="paid_at" type="datetime-local" defaultValue={paidAt} className={inputClass} /><FieldError errors={state.errors?.paid_at} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Kondisi transaksi", "Transaction status")}<select name="handling" value={handling} onChange={(event) => setHandling(event.target.value)} className={inputClass}><option value="normal">{localize(locale, "Normal · status otomatis", "Normal · automatic status")}</option><option value="failed">{localize(locale, "Gagal", "Failed")}</option>{payment?.status === "refunded" && <option value="refunded">{localize(locale, "Dikembalikan", "Refunded")}</option>}</select><FieldError errors={state.errors?.status} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">{localize(locale, "Nomor referensi", "Reference number")}<input name="reference_number" maxLength={120} defaultValue={payment?.reference_number ?? ""} placeholder={localize(locale, "Contoh: TRX-20260816-001", "Example: TRX-20260816-001")} className={inputClass} /><FieldError errors={state.errors?.reference_number} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">{localize(locale, "Catatan", "Notes")}<textarea name="notes" maxLength={2000} defaultValue={payment?.notes ?? ""} rows={3} placeholder={localize(locale, "Informasi tambahan untuk tim internal", "Additional information for the internal team")} className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary" /><FieldError errors={state.errors?.notes} /></label>
      <PaymentProofInput currentProofUrl={payment?.proof_url} errors={state.errors?.proof} />
    </div></section>
    <div className="flex flex-col gap-3 border-t py-8 sm:flex-row sm:justify-end"><Link href={payment ? `/internal/payments/${payment.id}` : "/internal/payments"} className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold hover:bg-surface-low">{localize(locale, "Batal", "Cancel")}</Link><button disabled={pending || !booking} className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white hover:bg-[#2f3131] disabled:opacity-60">{pending ? localize(locale, "Menyimpan…", "Saving…") : payment ? localize(locale, "Simpan perubahan", "Save changes") : localize(locale, "Tambahkan pembayaran", "Add payment")}</button></div>
  </form>;
}
