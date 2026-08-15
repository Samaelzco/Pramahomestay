import { BookingStatusBadge } from "@/components/bookings/booking-status";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, Booking } from "@/lib/api/types";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = { title: "Detail Booking" };
const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" });
const formatDate = (value: string) => date.format(new Date(`${value}T00:00:00`));

function Detail({ label, children, inverse = false }: { label: string; children: ReactNode; inverse?: boolean }) {
  return <div className="border-t pt-4"><dt className={`text-xs font-semibold tracking-[0.08em] uppercase ${inverse ? "text-white/60" : "text-muted"}`}>{label}</dt><dd className={`mt-2 text-sm leading-6 ${inverse ? "text-white" : ""}`}>{children}</dd></div>;
}

export default async function BookingDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string }> }) {
  const { id } = await params;
  const { success } = await searchParams;
  const { data: booking } = await apiFetch<ApiItem<Booking>>(`/internal/bookings/${encodeURIComponent(id)}`);
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
      <Link href="/internal/bookings" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke daftar booking</Link>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{booking.booking_code}</h1><BookingStatusBadge status={booking.status} label={booking.status_label} /></div><p className="mt-3 text-base text-muted">Reservasi {booking.guest_name} untuk {booking.room.name}.</p></div><Link href={`/internal/bookings/${booking.id}/edit`} className="inline-flex h-12 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-white hover:bg-[#2f3131]">Edit booking</Link></div>
      {success === "updated" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">Perubahan booking berhasil disimpan.</div>}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-lg bg-surface p-6 shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)] sm:p-8"><h2 className="text-2xl font-semibold tracking-[-0.02em]">Rincian menginap</h2><dl className="mt-7 grid gap-5 sm:grid-cols-2"><Detail label="Kamar">{booking.room.name} · {booking.room.type_label}</Detail><Detail label="Jumlah tamu">{booking.guest_count} tamu</Detail><Detail label="Check-in">{formatDate(booking.check_in)}</Detail><Detail label="Check-out">{formatDate(booking.check_out)}</Detail><Detail label="Durasi">{booking.total_nights} malam</Detail><Detail label="Tarif per malam">{currency.format(Number(booking.price_per_night))}</Detail></dl><div className="mt-8 flex items-end justify-between border-t pt-6"><span className="text-sm text-muted">Total booking</span><strong className="text-2xl tabular-nums">{currency.format(Number(booking.total_amount))}</strong></div></section>
        <section className="rounded-lg bg-primary p-6 text-white sm:p-8"><h2 className="text-xl font-semibold">Kontak tamu</h2><dl className="mt-6 grid gap-5"><Detail label="Nama" inverse>{booking.guest_name}</Detail><Detail label="Email" inverse><a href={`mailto:${booking.guest_email}`} className="underline underline-offset-4">{booking.guest_email}</a></Detail><Detail label="Telepon" inverse><a href={`tel:${booking.guest_phone}`} className="underline underline-offset-4">{booking.guest_phone}</a></Detail></dl></section>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2"><section className="border-t pt-6"><h2 className="text-lg font-semibold">Permintaan khusus</h2><p className="mt-3 text-sm leading-7 text-muted">{booking.special_requests || "Tidak ada permintaan khusus dari tamu."}</p></section><section className="border-t pt-6"><h2 className="text-lg font-semibold">Catatan internal</h2><p className="mt-3 text-sm leading-7 text-muted">{booking.internal_notes || "Belum ada catatan internal."}</p></section></div>
    </main>
  );
}
