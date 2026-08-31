import { BookingForm } from "@/components/bookings/booking-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, Guest, PaginatedGuests, PaginatedRooms } from "@/lib/api/types";
import type { Metadata } from "next";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import Link from "next/link";

export const metadata: Metadata = { title: "Tambah Booking" };

export default async function CreateBookingPage({ searchParams }: { searchParams: Promise<{ guest_id?: string }> }) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const params = await searchParams;
  const [{ data: rooms }, { data: firstGuests }, selectedGuestResponse] = await Promise.all([
    apiFetch<PaginatedRooms>("/internal/rooms?is_active=1&per_page=50"),
    apiFetch<PaginatedGuests>("/internal/guests?is_active=1&per_page=20"),
    params.guest_id ? apiFetch<ApiItem<Guest>>(`/internal/guests/${encodeURIComponent(params.guest_id)}`) : Promise.resolve(null),
  ]);
  const selectedGuest = selectedGuestResponse?.data.is_active ? selectedGuestResponse.data : undefined;
  const guests = selectedGuest && !firstGuests.some((guest) => guest.id === selectedGuest.id)
    ? [selectedGuest, ...firstGuests]
    : firstGuests;
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/bookings" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />{t("Kembali ke daftar booking", "Back to bookings")}</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{t("Tambah booking", "Add booking")}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{t("Pilih profil tamu dan jadwal menginap. Ketersediaan kamar diperiksa saat booking disimpan.", "Choose a guest profile and stay dates. Room availability is checked when the booking is saved.")}</p>{rooms.length > 0 && guests.length > 0 ? <BookingForm rooms={rooms} guests={guests} initialGuestId={params.guest_id} /> : <div className="mt-10 border-y bg-surface py-16 text-center"><h2 className="text-xl font-semibold">{t("Data operasional belum lengkap", "Operational data is incomplete")}</h2><p className="mt-3 text-sm text-muted">{t("Tambahkan minimal satu kamar aktif dan satu profil tamu sebelum membuat booking.", "Add at least one active room and one guest profile before creating a booking.")}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/internal/rooms/new" className="inline-flex h-11 items-center rounded-sm border bg-surface px-5 text-sm font-semibold">{t("Tambah kamar", "Add room")}</Link><Link href="/internal/guests/new" className="inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">{t("Tambah tamu", "Add guest")}</Link></div></div>}</main>;
}
