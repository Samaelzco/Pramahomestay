import type { Room } from "@/lib/api/types";
import { SearchIcon } from "@/components/ui/icons";

type Props = { search?: string; status?: string; roomId?: string; dateFrom?: string; dateTo?: string; rooms: Room[] };

export function BookingFilters({ search, status, roomId, dateFrom, dateTo, rooms }: Props) {
  return (
    <form className="mt-8 grid items-end gap-3 border-y py-5 lg:grid-cols-[1fr_180px_180px_150px_150px_auto]" method="get">
      <label className="relative"><span className="sr-only">Cari booking</span><SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder="Kode, nama, email, atau telepon" className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
      <label><span className="sr-only">Filter status</span><select name="status" defaultValue={status ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">Semua status</option><option value="pending">Menunggu</option><option value="confirmed">Dikonfirmasi</option><option value="checked_in">Check-in</option><option value="checked_out">Check-out</option><option value="cancelled">Dibatalkan</option></select></label>
      <label><span className="sr-only">Filter kamar</span><select name="room_id" defaultValue={roomId ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">Semua kamar</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
      <label><span className="mb-1.5 block text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">Mulai · TT/BB/TTTT</span><input name="date_from" type="date" defaultValue={dateFrom} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>
      <label><span className="mb-1.5 block text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">Akhir · TT/BB/TTTT</span><input name="date_to" type="date" defaultValue={dateTo} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>
      <button type="submit" className="h-12 rounded-sm bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]">Terapkan</button>
    </form>
  );
}
