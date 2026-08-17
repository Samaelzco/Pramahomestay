import type { Guest } from "@/lib/api/types";
import Link from "next/link";

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const date = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));

export function GuestList({ guests }: { guests: Guest[] }) {
  return <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
    <div className="hidden grid-cols-[1.15fr_1.25fr_0.75fr_0.9fr_0.85fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid"><span>Tamu</span><span>Kontak</span><span>Riwayat</span><span>Nilai booking</span><span>Terakhir</span><span>Aksi</span></div>
    <div className="divide-y">{guests.map((guest) => <article key={guest.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 lg:grid-cols-[1.15fr_1.25fr_0.75fr_0.9fr_0.85fr_auto] lg:items-center lg:px-6">
      <div><p className="font-semibold">{guest.full_name}</p><p className="mt-1 text-xs text-muted">Profil tamu #{guest.id}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Kontak</p><a href={`mailto:${guest.email}`} className="mt-1 block truncate text-sm font-medium hover:text-secondary lg:mt-0">{guest.email}</a><a href={`tel:${guest.phone}`} className="mt-1 block text-xs text-muted hover:text-secondary">{guest.phone}</a></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Riwayat</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{guest.stats.bookings} booking</p><p className="mt-1 text-xs text-muted">{guest.stats.completed_stays} selesai</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Nilai booking</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{currency.format(Number(guest.stats.total_booking_value))}</p><p className="mt-1 text-xs text-muted">Akumulasi reservasi</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Terakhir</p><p className="mt-1 text-sm font-medium lg:mt-0">{guest.stats.latest_check_in ? date(guest.stats.latest_check_in) : "Belum menginap"}</p></div>
      <Link href={`/internal/guests/${guest.id}`} className="inline-flex min-h-12 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">Lihat profil</Link>
    </article>)}</div>
  </div>;
}
