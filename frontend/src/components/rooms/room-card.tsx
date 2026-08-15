import type { Room } from "@/lib/api/types";
import Image from "next/image";
import Link from "next/link";

const statusStyle = {
  ready: "bg-[#edf4ef] text-[#28533b]",
  occupied: "bg-[#e8e8e8] text-primary",
  cleaning: "bg-[#f4ede3] text-[#795830]",
  maintenance: "bg-[#ffdad6] text-[#93000a]",
};

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

const operationalCopy = {
  ready: { note: "Siap menerima booking", action: "Edit detail kamar" },
  occupied: { note: "Sedang digunakan tamu", action: "Perbarui status kamar" },
  cleaning: { note: "Pembersihan sedang berlangsung", action: "Perbarui kesiapan" },
  maintenance: { note: "Dikeluarkan dari ketersediaan", action: "Kelola perawatan" },
};

export function RoomCard({ room }: { room: Room }) {
  const operation = operationalCopy[room.status];

  return (
    <article className="group flex min-h-[460px] flex-col overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-24px_rgba(68,71,72,0.28)] transition-transform duration-300 hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-high">
        {room.image_url ? <Image src={room.image_url} alt={`Foto ${room.name}`} fill sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center text-sm text-muted">Foto belum tersedia</div>}
        <span className={`absolute top-4 right-4 rounded-sm px-3 py-2 text-[10px] font-semibold tracking-[0.1em] uppercase ${statusStyle[room.status]}`}>{room.status_label}</span>
        {!room.is_active && <span className="absolute inset-x-0 bottom-0 bg-primary/85 px-4 py-2 text-xs font-medium text-white">Kamar dinonaktifkan</span>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-2xl font-semibold tracking-[-0.02em]">{room.name}</h2><p className="mt-1 text-sm text-muted">{room.type_label} · {room.capacity} tamu · {room.bed_count} bed</p></div>
          <div className="shrink-0 text-right"><p className="text-lg font-semibold tabular-nums">{currency.format(Number(room.price_per_night))}</p><p className="mt-1 text-xs text-muted">per malam</p></div>
        </div>
        <p className="mt-5 line-clamp-2 text-sm leading-6 text-muted">{room.description || "Deskripsi kamar belum ditambahkan."}</p>
        <p className="mt-5 flex items-center gap-2 text-xs font-medium text-muted"><span className="size-1.5 rounded-full bg-secondary" />{operation.note}</p>
        <div className="mt-4 flex flex-wrap gap-2">{room.amenities.slice(0, 4).map((amenity) => <span key={amenity} className="rounded-sm bg-surface-low px-2.5 py-1.5 text-xs text-muted">{amenity}</span>)}</div>
        <div className="mt-auto border-t pt-5"><Link href={`/internal/rooms/${room.id}/edit`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current">{operation.action}</Link></div>
      </div>
    </article>
  );
}
