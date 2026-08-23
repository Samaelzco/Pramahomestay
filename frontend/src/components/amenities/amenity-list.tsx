import { deleteAmenityAction, setAmenityActivationAction } from "@/app/internal/(dashboard)/amenities/actions";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { Amenity } from "@/lib/api/types";
import Link from "next/link";

export function AmenityList({ amenities }: { amenities: Amenity[] }) {
  return <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
    <div className="hidden grid-cols-[1.4fr_0.65fr_0.75fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase md:grid"><span>Fasilitas</span><span>Status</span><span>Digunakan</span><span>Aksi</span></div>
    <div className="divide-y">{amenities.map((amenity) => <article key={amenity.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 md:grid-cols-[1.4fr_0.65fr_0.75fr_auto] md:items-center md:px-6">
      <div><p className="font-semibold">{amenity.name}</p><p className="mt-1 max-w-xl text-sm leading-6 text-muted">{amenity.description || "Tanpa deskripsi"}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase md:hidden">Status</p><span className={`mt-1 inline-flex rounded-sm px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase md:mt-0 ${amenity.is_active ? "bg-[#edf4ef] text-[#28533b]" : "bg-surface-high text-muted"}`}>{amenity.is_active ? "Aktif" : "Nonaktif"}</span></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase md:hidden">Digunakan</p><p className="mt-1 text-sm font-medium tabular-nums md:mt-0">{amenity.room_count} kamar</p></div>
      <div className="flex flex-wrap items-center gap-x-4 md:flex-col md:items-start">
        <Link href={`/internal/amenities/${amenity.id}/edit`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">Edit</Link>
        <ConfirmAction action={setAmenityActivationAction.bind(null, amenity.id, !amenity.is_active)} trigger={amenity.is_active ? "Nonaktifkan" : "Aktifkan"} title={`${amenity.is_active ? "Nonaktifkan" : "Aktifkan"} ${amenity.name}?`} description={amenity.is_active ? "Fasilitas tidak lagi muncul sebagai pilihan untuk kamar baru. Kamar yang sudah memakainya tetap menyimpan fasilitas ini." : "Fasilitas kembali tersedia sebagai pilihan pada form kamar."} confirmLabel={amenity.is_active ? "Ya, nonaktifkan" : "Ya, aktifkan"} tone={amenity.is_active ? "danger" : "primary"} />
        <ConfirmAction action={deleteAmenityAction.bind(null, amenity.id)} trigger="Hapus" title={`Hapus ${amenity.name}?`} description="Fasilitas akan dihapus permanen dari daftar." confirmLabel="Ya, hapus fasilitas" disabled={!amenity.can_delete} />
      </div>
    </article>)}</div>
  </div>;
}
