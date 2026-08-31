"use client";

import { SearchIcon } from "@/components/ui/icons";
import { localize, useLocale } from "@/lib/locale";

export function EmailNotificationFilters({ search, status, type, perPage }: { search?: string; status?: string; type?: string; perPage?: string }) {
  const locale = useLocale();
  const input = "h-12 w-full border bg-surface px-4 text-sm outline-none focus:border-primary";
  return <form className="mt-10 grid gap-3 border-y py-5 sm:grid-cols-2 lg:grid-cols-[minmax(18rem,1fr)_13rem_16rem_auto]">
    <input type="hidden" name="per_page" value={perPage} />
    <label className="relative sm:col-span-2 lg:col-span-1"><span className="sr-only">{localize(locale, "Cari notifikasi", "Search notifications")}</span><SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder={localize(locale, "Kode booking, nama, atau email", "Booking code, name, or email")} className={`${input} pl-12`} /></label>
    <select name="status" defaultValue={status ?? ""} aria-label={localize(locale, "Status pengiriman", "Delivery status")} className={input}><option value="">{localize(locale, "Semua status", "All statuses")}</option><option value="queued">{localize(locale, "Dalam antrean", "Queued")}</option><option value="sent">{localize(locale, "Terkirim", "Sent")}</option><option value="failed">{localize(locale, "Gagal", "Failed")}</option></select>
    <select name="type" defaultValue={type ?? ""} aria-label={localize(locale, "Jenis notifikasi", "Notification type")} className={input}><option value="">{localize(locale, "Semua jenis", "All types")}</option><option value="booking_created">{localize(locale, "Booking dibuat", "Booking created")}</option><option value="payment_proof_submitted">{localize(locale, "Bukti diterima", "Receipt received")}</option><option value="payment_verified">{localize(locale, "Pembayaran terverifikasi", "Payment verified")}</option><option value="payment_rejected">{localize(locale, "Pembayaran ditolak", "Payment rejected")}</option><option value="booking_cancelled">{localize(locale, "Booking dibatalkan", "Booking cancelled")}</option><option value="payment_expired">{localize(locale, "Pembayaran kedaluwarsa", "Payment expired")}</option><option value="check_in_due">{localize(locale, "Check-in hari ini", "Check-in today")}</option><option value="check_out_due">{localize(locale, "Check-out hari ini", "Check-out today")}</option></select>
    <button className="min-h-12 bg-primary px-6 text-sm font-semibold text-white">{localize(locale, "Terapkan", "Apply")}</button>
  </form>;
}
