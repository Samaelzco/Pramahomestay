import { GuestFilters } from "@/components/guests/guest-filters";
import { GuestList } from "@/components/guests/guest-list";
import { PlusIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedGuests } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Tamu" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function GuestsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = { search: value(params.search), is_active: value(params.is_active), page: value(params.page) };
  const apiParams = new URLSearchParams({ per_page: "15" });
  Object.entries(query).forEach(([key, item]) => { if (item) apiParams.set(key, item); });
  const guests = await apiFetch<PaginatedGuests>(`/internal/guests?${apiParams.toString()}`);
  const success = value(params.success);

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Kelola tamu</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Simpan kontak utama, lihat riwayat menginap, dan pahami nilai setiap hubungan tamu.</p></div><Link href="/internal/guests/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]"><PlusIcon className="size-4" />Tambah tamu</Link></div>
    {success === "created" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">Tamu baru berhasil ditambahkan.</div>}
    <GuestFilters search={query.search} isActive={query.is_active} />
    <div className="mt-8 flex items-baseline justify-between"><p className="text-sm font-medium">{guests.meta.total} tamu ditemukan</p>{(query.search || query.is_active) && <Link href="/internal/guests" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">Hapus filter</Link>}</div>
    {guests.data.length ? <GuestList guests={guests.data} /> : <div className="mt-5 rounded-lg bg-surface py-20 text-center shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><h2 className="text-xl font-semibold">Belum ada tamu yang sesuai</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Ubah kata pencarian atau tambahkan profil tamu pertama.</p><Link href="/internal/guests/new" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">Tambah tamu</Link></div>}
    <Pagination meta={guests.meta} query={query} resourceName="tamu" />
  </main>;
}
