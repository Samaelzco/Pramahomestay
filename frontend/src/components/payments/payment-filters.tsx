"use client";

import { SearchIcon } from "@/components/ui/icons";
import { localize, useLocale } from "@/lib/locale";

type Props = { search?: string; status?: string; method?: string; dateFrom?: string; dateTo?: string };

export function PaymentFilters({ search, status, method, dateFrom, dateTo }: Props) {
  const locale = useLocale();
  return (
    <form className="mt-8 grid items-end gap-3 border-y py-5 sm:grid-cols-2 xl:grid-cols-[1fr_160px_170px_150px_150px_auto]" method="get">
      <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">{localize(locale, "Cari pembayaran", "Search payments")}</span><SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder={localize(locale, "Kode, tamu, atau referensi", "Code, guest, or reference")} className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
      <label><span className="sr-only">{localize(locale, "Filter status", "Filter by status")}</span><select name="status" defaultValue={status ?? ""} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua status", "All statuses")}</option><option value="unpaid">{localize(locale, "Belum dibayar", "Unpaid")}</option><option value="pending_verification">{localize(locale, "Menunggu verifikasi", "Pending verification")}</option><option value="partial">{localize(locale, "Dibayar sebagian", "Partially paid")}</option><option value="paid">{localize(locale, "Lunas", "Paid")}</option><option value="failed">{localize(locale, "Gagal", "Failed")}</option><option value="refunded">{localize(locale, "Dikembalikan", "Refunded")}</option></select></label>
      <label><span className="sr-only">{localize(locale, "Filter metode", "Filter by method")}</span><select name="method" defaultValue={method ?? ""} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua metode", "All methods")}</option><option value="cash">{localize(locale, "Tunai", "Cash")}</option><option value="bank_transfer">{localize(locale, "Transfer bank", "Bank transfer")}</option><option value="qris">QRIS</option><option value="card">{localize(locale, "Kartu", "Card")}</option></select></label>
      <label><span className="mb-1.5 block text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">{localize(locale, "Mulai · TT/BB/TTTT", "Start · MM/DD/YYYY")}</span><input name="date_from" type="date" defaultValue={dateFrom} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>
      <label><span className="mb-1.5 block text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">{localize(locale, "Akhir · TT/BB/TTTT", "End · MM/DD/YYYY")}</span><input name="date_to" type="date" defaultValue={dateTo} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>
      <button type="submit" className="h-12 rounded-sm bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] sm:col-span-2 xl:col-span-1">{localize(locale, "Terapkan", "Apply")}</button>
    </form>
  );
}
