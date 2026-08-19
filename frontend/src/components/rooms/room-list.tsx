import { deleteRoomAction, setRoomActivationAction } from "@/app/internal/(dashboard)/rooms/actions";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { Room } from "@/lib/api/types";
import Link from "next/link";

const statusStyle = {
  ready: "bg-[#edf4ef] text-[#28533b]",
  occupied: "bg-[#e8edf4] text-[#304d72]",
  cleaning: "bg-[#f4ede3] text-[#68491f]",
  maintenance: "bg-[#ffdad6] text-[#93000a]",
};

const operationalCopy = {
  ready: "Siap menerima booking",
  occupied: "Sedang digunakan tamu",
  cleaning: "Pembersihan berlangsung",
  maintenance: "Tidak tersedia untuk booking",
};

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function RoomStatus({ room }: { room: Room }) {
  return <span className={`inline-flex rounded-sm px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${statusStyle[room.status]}`}>{room.status_label}</span>;
}

export function RoomList({ rooms }: { rooms: Room[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
      <div className="hidden grid-cols-[1.2fr_0.9fr_1.2fr_0.8fr_0.9fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid">
        <span>Kamar</span><span>Tipe</span><span>Status</span><span>Kapasitas</span><span>Tarif</span><span>Aksi</span>
      </div>
      <div className="divide-y">
        {rooms.map((room) => (
          <article key={room.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_1.2fr_0.8fr_0.9fr_auto] lg:items-center lg:px-6">
            <div><p className="font-semibold">{room.name}</p><p className="mt-1 text-xs text-muted">{room.is_active ? "Aktif di inventori" : "Dinonaktifkan"}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Tipe</p><p className="mt-1 text-sm font-medium lg:mt-0">{room.type_label}</p><p className="mt-1 text-xs text-muted">{room.size_sqm ? `${Number(room.size_sqm).toLocaleString("id-ID")} m²` : "Ukuran belum dicatat"}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Status</p><div className="mt-2 lg:mt-0"><RoomStatus room={room} /></div><p className="mt-2 text-xs text-muted">{operationalCopy[room.status]}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Kapasitas</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{room.capacity} tamu</p><p className="mt-1 text-xs text-muted">{room.bed_count} tempat tidur</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Tarif</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{currency.format(Number(room.price_per_night))}</p><p className="mt-1 text-xs text-muted">per malam</p></div>
            <div className="flex flex-wrap items-center gap-x-4 lg:flex-col lg:items-start">
              <Link href={`/internal/rooms/${room.id}/edit`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">Edit detail</Link>
              <ConfirmAction action={setRoomActivationAction.bind(null, room.id, !room.is_active)} trigger={room.is_active ? "Nonaktifkan" : "Aktifkan"} title={room.is_active ? `Nonaktifkan ${room.name}?` : `Aktifkan ${room.name}?`} description={room.is_active ? "Kamar tidak muncul sebagai pilihan untuk booking baru. Booking yang sudah tercatat tetap tersimpan." : "Kamar kembali tersedia dalam alur booking baru sesuai status operasionalnya."} confirmLabel={room.is_active ? "Ya, nonaktifkan" : "Ya, aktifkan"} tone={room.is_active ? "danger" : "primary"} />
              <ConfirmAction action={deleteRoomAction.bind(null, room.id)} trigger="Hapus" title={`Hapus ${room.name}?`} description="Kamar akan dihapus dari inventori aktif. Aksi ini hanya tersedia karena kamar belum memiliki riwayat booking." confirmLabel="Ya, hapus kamar" disabled={!room.can_delete} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
