import { PaymentFilters } from "@/components/payments/payment-filters";
import { PaymentList } from "@/components/payments/payment-list";
import { PlusIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedPayments } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pembayaran" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = { search: value(params.search), status: value(params.status), method: value(params.method), date_from: value(params.date_from), date_to: value(params.date_to), page: value(params.page) };
  const apiParams = new URLSearchParams({ per_page: "15" });
  Object.entries(query).forEach(([key, item]) => { if (item) apiParams.set(key, item); });
  const payments = await apiFetch<PaginatedPayments>(`/internal/payments?${apiParams.toString()}`);
  const success = value(params.success);
  const hasFilters = query.search || query.status || query.method || query.date_from || query.date_to;
  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Kelola pembayaran</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Rekonsiliasi tagihan booking, pantau sisa pembayaran, dan simpan bukti transaksi.</p></div><Link href="/internal/payments/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white hover:bg-[#2f3131]"><PlusIcon className="size-4" />Tambah pembayaran</Link></div>
    {success === "created" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">Pembayaran baru berhasil ditambahkan.</div>}
    <PaymentFilters {...query} dateFrom={query.date_from} dateTo={query.date_to} />
    <div className="mt-8 flex items-baseline justify-between"><p className="text-sm font-medium">{payments.meta.total} pembayaran ditemukan</p>{hasFilters && <Link href="/internal/payments" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">Hapus filter</Link>}</div>
    {payments.data.length > 0 ? <PaymentList payments={payments.data} /> : <div className="mt-5 rounded-lg bg-surface py-20 text-center shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><h2 className="text-xl font-semibold">Belum ada pembayaran yang sesuai</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Ubah filter atau catat pembayaran pertama untuk booking yang tersedia.</p><Link href="/internal/payments/new" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">Tambah pembayaran</Link></div>}
    <Pagination meta={payments.meta} query={query} resourceName="pembayaran" />
  </main>;
}
