import { Pagination } from "@/components/rooms/pagination";
import { RoomCard } from "@/components/rooms/room-card";
import { RoomFilters } from "@/components/rooms/room-filters";
import { PlusIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedRooms } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Kamar" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function RoomsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = { search: value(params.search), status: value(params.status), type: value(params.type), page: value(params.page) };
  const apiParams = new URLSearchParams({ per_page: "12" });
  Object.entries(query).forEach(([key, item]) => { if (item) apiParams.set(key, item); });
  const rooms = await apiFetch<PaginatedRooms>(`/internal/rooms?${apiParams.toString()}`);
  const success = value(params.success);

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Kelola kamar</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Pantau kesiapan, harga, dan detail setiap unit dari satu tempat.</p></div>
        <Link href="/internal/rooms/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]"><PlusIcon className="size-4" />Tambah kamar</Link>
      </div>
      {success && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">{success === "created" ? "Kamar baru berhasil ditambahkan." : "Perubahan kamar berhasil disimpan."}</div>}
      <RoomFilters search={query.search} status={query.status} type={query.type} />
      <div className="mt-8 flex items-baseline justify-between"><p className="text-sm font-medium">{rooms.meta.total} kamar ditemukan</p>{(query.search || query.status || query.type) && <Link href="/internal/rooms" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">Hapus filter</Link>}</div>
      {rooms.data.length > 0 ? <div className="mt-5 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">{rooms.data.map((room) => <RoomCard key={room.id} room={room} />)}</div> : <div className="mt-5 border-y bg-surface py-20 text-center"><h2 className="text-xl font-semibold">Belum ada kamar yang sesuai</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Ubah kata pencarian atau filter. Jika inventori masih kosong, tambahkan kamar pertama.</p><Link href="/internal/rooms/new" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">Tambah kamar</Link></div>}
      <Pagination meta={rooms.meta} query={query} />
    </main>
  );
}
