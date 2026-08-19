import { BookingForm } from "@/components/bookings/booking-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, Booking, PaginatedGuests, PaginatedRooms } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Edit Booking" };

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: booking }, rooms, guests] = await Promise.all([
    apiFetch<ApiItem<Booking>>(`/internal/bookings/${encodeURIComponent(id)}`),
    apiFetch<PaginatedRooms>("/internal/rooms?per_page=50"),
    apiFetch<PaginatedGuests>("/internal/guests?is_active=1&per_page=20"),
  ]);
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href={`/internal/bookings/${booking.id}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke detail booking</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Edit {booking.booking_code}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Perbarui profil tamu terpilih, jadwal, kamar, atau status operasional reservasi.</p><BookingForm rooms={rooms.data} guests={guests.data} booking={booking} /></main>;
}
