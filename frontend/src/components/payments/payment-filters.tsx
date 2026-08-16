import { SearchIcon } from "@/components/ui/icons";

type Props = { search?: string; status?: string; method?: string; dateFrom?: string; dateTo?: string };

export function PaymentFilters({ search, status, method, dateFrom, dateTo }: Props) {
  return (
    <form className="mt-8 grid items-end gap-3 border-y py-5 sm:grid-cols-2 lg:grid-cols-[1fr_160px_170px_150px_150px_auto]" method="get">
      <label className="relative sm:col-span-2 lg:col-span-1"><span className="sr-only">Cari pembayaran</span><SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder="Kode, tamu, atau referensi" className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
      <label><span className="sr-only">Filter status</span><select name="status" defaultValue={status ?? ""} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary"><option value="">Semua status</option><option value="unpaid">Belum dibayar</option><option value="partial">Dibayar sebagian</option><option value="paid">Lunas</option><option value="failed">Gagal</option><option value="refunded">Dikembalikan</option></select></label>
      <label><span className="sr-only">Filter metode</span><select name="method" defaultValue={method ?? ""} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary"><option value="">Semua metode</option><option value="cash">Tunai</option><option value="bank_transfer">Transfer bank</option><option value="qris">QRIS</option><option value="card">Kartu</option></select></label>
      <label><span className="mb-1.5 block text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">Mulai · TT/BB/TTTT</span><input name="date_from" type="date" defaultValue={dateFrom} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>
      <label><span className="mb-1.5 block text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">Akhir · TT/BB/TTTT</span><input name="date_to" type="date" defaultValue={dateTo} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>
      <button type="submit" className="h-12 rounded-sm bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] sm:col-span-2 lg:col-span-1">Terapkan</button>
    </form>
  );
}
