import { BookingFlowHeader } from "@/components/public/booking-flow-header";
import { RoomAvailabilityForm } from "@/components/public/room-availability-form";
import { RoomDetailGallery } from "@/components/public/room-detail-gallery";
import { ArrowLeftIcon, ArrowRightIcon, BedIcon, CalendarIcon, CheckIcon, UsersIcon } from "@/components/ui/icons";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ApiItem, PublicAmenity, PublicRoomDetailData } from "@/lib/api/types";
import { serverLocale, serverLocalize, type ServerLocale } from "@/lib/locale-server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ check_in?: string; check_out?: string; guests?: string }>;
};

function localizedDescription(amenity: PublicAmenity, locale: ServerLocale) {
  const value = locale === "en" && amenity.description_en?.trim() ? amenity.description_en : amenity.description;
  return value?.trim() || null;
}

function formatMoney(value: string | number, locale: ServerLocale) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
}

async function fetchRoom(id: string, query = "") {
  if (!/^\d+$/.test(id)) notFound();
  try {
    return await apiFetch<ApiItem<PublicRoomDetailData>>(`/public/rooms/${id}${query}`, {}, false);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await fetchRoom(id);
    return {
      title: data.room.name,
      description: data.room.description_en?.trim() || data.room.description,
    };
  } catch {
    return { title: "Kamar" };
  }
}

export default async function RoomDetailPage({ params, searchParams }: PageProps) {
  const locale = await serverLocale();
  const { id } = await params;
  const incoming = await searchParams;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar" }).format(new Date());
  const checkIn = /^\d{4}-\d{2}-\d{2}$/.test(incoming.check_in ?? "") && incoming.check_in! >= today ? incoming.check_in! : "";
  const checkOut = /^\d{4}-\d{2}-\d{2}$/.test(incoming.check_out ?? "") && incoming.check_out! > checkIn ? incoming.check_out! : "";
  const guestValue = Number(incoming.guests);
  const guests = Number.isInteger(guestValue) && guestValue >= 1 && guestValue <= 20 ? guestValue : 1;
  const query = new URLSearchParams({ guests: String(guests) });
  if (checkIn && checkOut) {
    query.set("check_in", checkIn);
    query.set("check_out", checkOut);
  }

  const { data } = await fetchRoom(id, `?${query}`);
  const { room, property, availability } = data;
  const description = locale === "en" && room.description_en?.trim() ? room.description_en : room.description;
  const nights = checkIn && checkOut ? Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000) : 0;
  const bookingQuery = new URLSearchParams({ check_in: checkIn, check_out: checkOut, guests: String(guests), room_id: String(room.id) });

  return <div className="booking-page min-h-screen bg-background text-foreground">
    <BookingFlowHeader propertyName={property.name} locale={locale} />

    <main className="mx-auto w-full max-w-[1600px] px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <Link href="/booking" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />{serverLocalize(locale, "Kembali pilih kamar", "Back to room selection")}</Link>

      <div className="mt-5 flex flex-col justify-between gap-5 sm:mt-7 sm:flex-row sm:items-end">
        <div><h1 className="text-balance text-[clamp(2.7rem,5vw,5.6rem)] leading-[0.96] font-semibold tracking-[-0.04em]">{room.name}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">{description}</p></div>
        <p className="shrink-0 text-xl font-bold sm:text-right">{formatMoney(room.price_per_night, locale)}<span className="ml-1 text-sm font-normal text-muted">/{serverLocalize(locale, "malam", "night")}</span></p>
      </div>

      <div className="mt-8 sm:mt-10"><RoomDetailGallery images={room.images} roomName={room.name} locale={locale} /></div>

      <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_27rem] xl:gap-20">
        <div>
          <section aria-labelledby="room-facts" className="border-y py-6">
            <h2 id="room-facts" className="sr-only">{serverLocalize(locale, "Detail kamar", "Room details")}</h2>
            <dl className="grid gap-6 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-center gap-3"><UsersIcon className="size-5 text-secondary" /><div><dt className="text-muted">{serverLocalize(locale, "Kapasitas", "Capacity")}</dt><dd className="mt-1 font-semibold">{room.capacity} {serverLocalize(locale, "tamu", room.capacity === 1 ? "guest" : "guests")}</dd></div></div>
              <div className="flex items-center gap-3"><BedIcon className="size-5 text-secondary" /><div><dt className="text-muted">{serverLocalize(locale, "Tempat tidur", "Beds")}</dt><dd className="mt-1 font-semibold">{room.bed_count}</dd></div></div>
              <div className="flex items-center gap-3"><CalendarIcon className="size-5 text-secondary" /><div><dt className="text-muted">{serverLocalize(locale, "Check-in", "Check-in")}</dt><dd className="mt-1 font-semibold">{property.check_in_time ?? "—"}</dd></div></div>
              <div className="flex items-center gap-3"><CalendarIcon className="size-5 text-secondary" /><div><dt className="text-muted">{serverLocalize(locale, "Check-out", "Check-out")}</dt><dd className="mt-1 font-semibold">{property.check_out_time ?? "—"}</dd></div></div>
            </dl>
          </section>

          <section className="py-12 sm:py-16">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{serverLocalize(locale, "Fasilitas di kamar", "Amenities in the room")}</h2>
            {room.amenities.length ? <div className="mt-8 grid gap-x-10 sm:grid-cols-2">
              {room.amenities.map((amenity) => <article key={amenity.id} className="flex gap-4 border-t py-5"><span className="mt-0.5 grid size-8 shrink-0 place-items-center bg-secondary-soft text-secondary"><CheckIcon className="size-4" /></span><div><h3 className="font-semibold">{locale === "en" && amenity.name_en?.trim() ? amenity.name_en : amenity.name}</h3>{localizedDescription(amenity, locale) && <p className="mt-1.5 text-sm leading-6 text-muted">{localizedDescription(amenity, locale)}</p>}</div></article>)}
            </div> : <p className="mt-6 text-muted">{serverLocalize(locale, "Fasilitas kamar belum dicantumkan.", "Room amenities have not been listed yet.")}</p>}
          </section>

          <section className="bg-surface-warm p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{serverLocalize(locale, "Yang perlu diketahui", "Things to know")}</h2>
            <div className="mt-6 grid gap-5 text-sm leading-6 sm:grid-cols-2"><div><p className="font-semibold">{serverLocalize(locale, "Waktu menginap", "Stay times")}</p><p className="mt-1 text-muted">{serverLocalize(locale, `Check-in mulai ${property.check_in_time ?? "sesuai konfirmasi"}, check-out sebelum ${property.check_out_time ?? "sesuai konfirmasi"}.`, `Check-in from ${property.check_in_time ?? "as confirmed"}, check-out before ${property.check_out_time ?? "as confirmed"}.`)}</p></div><div><p className="font-semibold">{serverLocalize(locale, "Konfirmasi reservasi", "Reservation confirmation")}</p><p className="mt-1 text-muted">{serverLocalize(locale, "Permintaan booking dikonfirmasi setelah detail dan pembayaran diperiksa oleh tim.", "Booking requests are confirmed after the team reviews the details and payment.")}</p></div></div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="bg-surface p-6 shadow-[0_22px_60px_-42px_rgba(0,0,0,0.5)] sm:p-7">
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-muted">{serverLocalize(locale, "Mulai dari", "From")}</p><p className="mt-1 text-2xl font-bold">{formatMoney(room.price_per_night, locale)}</p></div><p className="pb-1 text-sm text-muted">/{serverLocalize(locale, "malam", "night")}</p></div>
            <div className="my-6 border-t" />
            <RoomAvailabilityForm roomId={room.id} today={today} maxGuests={room.capacity} checkIn={checkIn} checkOut={checkOut} guests={guests} locale={locale} />

            {availability.checked && <div aria-live="polite" className={`mt-5 p-4 text-sm ${availability.is_available ? "bg-[#edf4ef] text-[#28533b]" : "bg-[#fff0cc] text-[#735500]"}`}>
              <p className="font-semibold">{availability.is_available ? serverLocalize(locale, "Kamar tersedia pada tanggal ini", "Room available for these dates") : availability.reason === "capacity" ? serverLocalize(locale, "Jumlah tamu melebihi kapasitas kamar", "Guest count exceeds room capacity") : serverLocalize(locale, "Kamar tidak tersedia pada tanggal ini", "Room unavailable for these dates")}</p>
              {availability.is_available && <p className="mt-1 opacity-80">{nights} {serverLocalize(locale, "malam", nights === 1 ? "night" : "nights")} · {guests} {serverLocalize(locale, "tamu", guests === 1 ? "guest" : "guests")}</p>}
            </div>}

            {availability.checked && availability.is_available && <>
              <div className="mt-5 flex items-center justify-between border-t pt-5"><span className="text-sm text-muted">{serverLocalize(locale, "Estimasi total", "Estimated total")}</span><strong className="text-lg">{formatMoney(Number(room.price_per_night) * nights, locale)}</strong></div>
              <Link href={`/booking?${bookingQuery}#guest-details`} className="group mt-5 flex min-h-13 items-center justify-center gap-3 bg-primary px-6 text-sm font-bold text-background transition-transform hover:-translate-y-0.5">{serverLocalize(locale, "Pesan kamar ini", "Book this room")}<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></Link>
            </>}
            <p className="mt-5 text-center text-xs leading-5 text-muted">{serverLocalize(locale, "Belum ada pembayaran pada tahap pengecekan ini.", "No payment is required at this availability check.")}</p>
          </div>
        </aside>
      </div>
    </main>

    <footer className="mt-16 bg-[#111313] text-white sm:mt-24"><div className="mx-auto grid w-full max-w-[1600px] gap-8 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:px-12"><div><p className="text-lg font-bold">{property.name}</p><p className="mt-2 max-w-md text-sm leading-6 text-white/60">{property.address}</p></div><div className="text-sm text-white/60 sm:text-right"><p>{property.phone ?? serverLocalize(locale, "Nomor telepon belum tersedia", "Phone number not available")}</p><p className="mt-2">{property.email ?? serverLocalize(locale, "Email belum tersedia", "Email not available")}</p></div></div><div className="mx-5 border-t border-white/10 py-5 text-xs text-white/45 sm:mx-8 lg:mx-12">© {new Date().getFullYear()} {property.name}</div></footer>
  </div>;
}
