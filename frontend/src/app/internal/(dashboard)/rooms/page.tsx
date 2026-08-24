import { Pagination } from "@/components/ui/pagination";
import { RoomList } from "@/components/rooms/room-list";
import { RoomFilters } from "@/components/rooms/room-filters";
import { PlusIcon } from "@/components/ui/icons";
import { LocalizedText } from "@/components/ui/localized-text";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedRooms } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Kamar" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function RoomsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = { search: value(params.search), status: value(params.status), is_active: value(params.is_active), page: value(params.page) };
  const apiParams = new URLSearchParams({ per_page: "15" });
  Object.entries(query).forEach(([key, item]) => { if (item) apiParams.set(key, item); });
  const rooms = await apiFetch<PaginatedRooms>(`/internal/rooms?${apiParams.toString()}`);
  const success = value(params.success);

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl"><LocalizedText id="Kelola kamar" en="Manage rooms" /></h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted"><LocalizedText id="Pantau kesiapan, harga, dan detail setiap unit dari satu tempat." en="Monitor readiness, rates, and details for every unit in one place." /></p></div>
        <Link href="/internal/rooms/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]"><PlusIcon className="size-4" /><LocalizedText id="Tambah kamar" en="Add room" /></Link>
      </div>
      {success && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">{success === "created" ? <LocalizedText id="Kamar baru berhasil ditambahkan." en="The new room was added successfully." /> : <LocalizedText id="Perubahan kamar berhasil disimpan." en="Room changes were saved successfully." />}</div>}
      <RoomFilters search={query.search} status={query.status} isActive={query.is_active} />
      <div className="mt-8 flex items-baseline justify-between"><p className="text-sm font-medium">{rooms.meta.total} <LocalizedText id="kamar ditemukan" en={rooms.meta.total === 1 ? "room found" : "rooms found"} /></p>{(query.search || query.status || query.is_active) && <Link href="/internal/rooms" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline"><LocalizedText id="Hapus filter" en="Clear filters" /></Link>}</div>
      {rooms.data.length > 0 ? <RoomList rooms={rooms.data} /> : <div className="mt-5 rounded-lg bg-surface py-20 text-center shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><h2 className="text-xl font-semibold"><LocalizedText id="Belum ada kamar yang sesuai" en="No matching rooms" /></h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted"><LocalizedText id="Ubah kata pencarian atau filter. Jika inventori masih kosong, tambahkan kamar pertama." en="Adjust the search term or filters. If the inventory is empty, add the first room." /></p><Link href="/internal/rooms/new" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white"><LocalizedText id="Tambah kamar" en="Add room" /></Link></div>}
      <Pagination meta={rooms.meta} query={query} resourceName="kamar" resourceNameEn="Rooms" />
    </main>
  );
}
