import { BookingFilters } from "@/components/bookings/booking-filters";
import { BookingList } from "@/components/bookings/booking-list";
import { PlusIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedBookings, PaginatedRooms } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Booking" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function BookingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = { search: value(params.search), status: value(params.status), room_id: value(params.room_id), date_from: value(params.date_from), date_to: value(params.date_to), page: value(params.page) };
  const apiParams = new URLSearchParams({ per_page: "15" });
  Object.entries(query).forEach(([key, item]) => { if (item) apiParams.set(key, item); });
  const [bookings, rooms] = await Promise.all([
    apiFetch<PaginatedBookings>(`/internal/bookings?${apiParams.toString()}`),
    apiFetch<PaginatedRooms>("/internal/rooms?per_page=50"),
  ]);
  const success = value(params.success);
  const hasFilters = query.search || query.status || query.room_id || query.date_from || query.date_to;

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Kelola booking</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Pantau jadwal menginap, data tamu, status, dan nilai setiap reservasi.</p></div>
        <Link href="/internal/bookings/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]"><PlusIcon className="size-4" />Tambah booking</Link>
      </div>
      {success === "created" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">Booking baru berhasil ditambahkan.</div>}
      <BookingFilters search={query.search} status={query.status} roomId={query.room_id} dateFrom={query.date_from} dateTo={query.date_to} rooms={rooms.data} />
      <div className="mt-8 flex items-baseline justify-between"><p className="text-sm font-medium">{bookings.meta.total} booking ditemukan</p>{hasFilters && <Link href="/internal/bookings" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">Hapus filter</Link>}</div>
      {bookings.data.length > 0 ? <BookingList bookings={bookings.data} /> : <div className="mt-5 border-y bg-surface py-20 text-center"><h2 className="text-xl font-semibold">Belum ada booking yang sesuai</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Ubah pencarian atau rentang tanggal. Jika daftar masih kosong, tambahkan booking pertama.</p><Link href="/internal/bookings/new" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">Tambah booking</Link></div>}
      <Pagination meta={bookings.meta} query={query} resourceName="booking" />
    </main>
  );
}
