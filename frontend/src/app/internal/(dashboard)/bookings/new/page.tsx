import { BookingForm } from "@/components/bookings/booking-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedRooms } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Tambah Booking" };

export default async function CreateBookingPage() {
  const rooms = await apiFetch<PaginatedRooms>("/internal/rooms?is_active=1&per_page=50");
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/bookings" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke daftar booking</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Tambah booking</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Catat data tamu dan jadwal menginap. Ketersediaan kamar diperiksa saat booking disimpan.</p>{rooms.data.length > 0 ? <BookingForm rooms={rooms.data} /> : <div className="mt-10 border-y bg-surface py-16 text-center"><h2 className="text-xl font-semibold">Belum ada kamar aktif</h2><p className="mt-3 text-sm text-muted">Aktifkan atau tambahkan kamar sebelum membuat booking.</p><Link href="/internal/rooms/new" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">Tambah kamar</Link></div>}</main>;
}
