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
  const stayQuery = new URLSearchParams({ check_in: checkIn, check_out: checkOut, guests: String(guests) });
  const bookingQuery = new URLSearchParams({ check_in: checkIn, check_out: checkOut, guests: String(guests), room_id: String(room.id) });
  const canBook = availability.checked && availability.is_available;
  const reservationHref = canBook ? `/booking?${bookingQuery}#guest-details` : "#room-reservation";

  return <div className="booking-page min-h-screen bg-background text-foreground">
    <BookingFlowHeader propertyName={property.name} logoUrl={property.logo_url} locale={locale} />

    <main className="mx-auto w-full max-w-[1440px] px-5 pt-7 pb-28 sm:px-8 sm:pt-10 lg:px-12 lg:pt-12 lg:pb-24">
      <Link href={`/booking?${stayQuery}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />{serverLocalize(locale, "Kembali pilih kamar", "Back to room selection")}</Link>

      <div className="mt-5 grid gap-7 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-16">
        <div><h1 className="text-balance text-[clamp(3rem,5vw,5.5rem)] leading-[0.96] font-semibold tracking-[-0.04em]">{room.name}</h1><p className="mt-5 max-w-[68ch] text-base leading-7 text-muted sm:text-lg sm:leading-8">{description}</p></div>
        <div className="flex items-end justify-between gap-6 border-t pt-5 lg:block lg:border-t-0 lg:pt-0 lg:text-right"><p className="text-sm text-muted">{serverLocalize(locale, "Harga per malam", "Price per night")}</p><p className="text-2xl font-bold tracking-[-0.02em] tabular-nums sm:text-3xl">{formatMoney(room.price_per_night, locale)}</p></div>
      </div>

      <div className="mt-8 sm:mt-10 lg:mt-12"><RoomDetailGallery images={room.images} roomName={room.name} locale={locale} /></div>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-14 xl:grid-cols-[minmax(0,1fr)_27rem] xl:gap-20">
        <aside id="room-reservation" className="order-1 scroll-mt-24 lg:order-2">
          <div className="overflow-hidden rounded-lg bg-surface shadow-[0_28px_80px_-48px_rgba(20,17,12,0.55)]">
            <div className="bg-[#171817] p-6 text-white sm:p-7">
              <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-white/60">{serverLocalize(locale, "Mulai dari", "From")}</p><p className="mt-1 text-2xl font-bold tracking-[-0.02em] tabular-nums">{formatMoney(room.price_per_night, locale)}</p></div><p className="pb-1 text-sm text-white/55">/{serverLocalize(locale, "malam", "night")}</p></div>
            </div>
            <div className="p-6 sm:p-7">
              <RoomAvailabilityForm roomId={room.id} today={today} maxGuests={room.capacity} checkIn={checkIn} checkOut={checkOut} guests={guests} locale={locale} />

              {availability.checked && <div aria-live="polite" className={`mt-5 rounded-sm p-4 text-sm ${availability.is_available ? "bg-[#edf4ef] text-[#28533b]" : "bg-[#fff0cc] text-[#735500]"}`}>
                <p className="font-semibold">{availability.is_available ? serverLocalize(locale, "Kamar tersedia pada tanggal ini", "Room available for these dates") : availability.reason === "capacity" ? serverLocalize(locale, "Jumlah tamu melebihi kapasitas kamar", "Guest count exceeds room capacity") : serverLocalize(locale, "Kamar tidak tersedia pada tanggal ini", "Room unavailable for these dates")}</p>
                {availability.is_available && <p className="mt-1 opacity-80">{nights} {serverLocalize(locale, "malam", nights === 1 ? "night" : "nights")} · {guests} {serverLocalize(locale, "tamu", guests === 1 ? "guest" : "guests")}</p>}
              </div>}

              {canBook && <>
                <div className="mt-5 flex items-center justify-between border-t pt-5"><span className="text-sm text-muted">{serverLocalize(locale, "Estimasi total", "Estimated total")}</span><strong className="text-lg tabular-nums">{formatMoney(Number(room.price_per_night) * nights, locale)}</strong></div>
                <Link href={`/booking?${bookingQuery}#guest-details`} className="group mt-5 flex min-h-13 items-center justify-center gap-3 rounded-sm bg-secondary px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">{serverLocalize(locale, "Pesan kamar ini", "Book this room")}<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></Link>
              </>}
              <p className="mt-5 text-center text-xs leading-5 text-muted">{serverLocalize(locale, "Belum ada pembayaran pada tahap pengecekan ini.", "No payment is required at this availability check.")}</p>
            </div>
          </div>
        </aside>

        <div className="order-2 lg:order-1">
          <section aria-labelledby="room-facts" className="border-y py-7">
            <h2 id="room-facts" className="sr-only">{serverLocalize(locale, "Detail kamar", "Room details")}</h2>
            <dl className="grid grid-cols-2 gap-x-5 gap-y-7 text-sm sm:grid-cols-4">
              <div className="flex items-center gap-3"><UsersIcon className="size-5 text-secondary" /><div><dt className="text-muted">{serverLocalize(locale, "Kapasitas", "Capacity")}</dt><dd className="mt-1 font-semibold">{room.capacity} {serverLocalize(locale, "tamu", room.capacity === 1 ? "guest" : "guests")}</dd></div></div>
              <div className="flex items-center gap-3"><BedIcon className="size-5 text-secondary" /><div><dt className="text-muted">{serverLocalize(locale, "Tempat tidur", "Beds")}</dt><dd className="mt-1 font-semibold">{room.bed_count}</dd></div></div>
              <div className="flex items-center gap-3"><CalendarIcon className="size-5 text-secondary" /><div><dt className="text-muted">{serverLocalize(locale, "Check-in", "Check-in")}</dt><dd className="mt-1 font-semibold">{property.check_in_time ?? "—"}</dd></div></div>
              <div className="flex items-center gap-3"><CalendarIcon className="size-5 text-secondary" /><div><dt className="text-muted">{serverLocalize(locale, "Check-out", "Check-out")}</dt><dd className="mt-1 font-semibold">{property.check_out_time ?? "—"}</dd></div></div>
            </dl>
          </section>

          <section className="mt-10 rounded-lg bg-surface-warm p-6 sm:mt-14 sm:p-8 lg:p-10">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{serverLocalize(locale, "Fasilitas di kamar", "Amenities in the room")}</h2>
            {room.amenities.length ? <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {room.amenities.map((amenity) => <article key={amenity.id} className="flex gap-4"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-sm bg-secondary text-white"><CheckIcon className="size-4" /></span><div><h3 className="font-semibold">{locale === "en" && amenity.name_en?.trim() ? amenity.name_en : amenity.name}</h3>{localizedDescription(amenity, locale) && <p className="mt-1.5 text-sm leading-6 text-muted">{localizedDescription(amenity, locale)}</p>}</div></article>)}
            </div> : <p className="mt-6 text-muted">{serverLocalize(locale, "Fasilitas kamar belum dicantumkan.", "Room amenities have not been listed yet.")}</p>}
          </section>

          <section className="mt-10 border-t pt-10 sm:mt-14 sm:pt-12">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{serverLocalize(locale, "Yang perlu diketahui", "Things to know")}</h2>
            <div className="mt-6 grid gap-5 text-sm leading-6 sm:grid-cols-2"><div><p className="font-semibold">{serverLocalize(locale, "Waktu menginap", "Stay times")}</p><p className="mt-1 text-muted">{serverLocalize(locale, `Check-in mulai ${property.check_in_time ?? "sesuai konfirmasi"}, check-out sebelum ${property.check_out_time ?? "sesuai konfirmasi"}.`, `Check-in from ${property.check_in_time ?? "as confirmed"}, check-out before ${property.check_out_time ?? "as confirmed"}.`)}</p></div><div><p className="font-semibold">{serverLocalize(locale, "Konfirmasi reservasi", "Reservation confirmation")}</p><p className="mt-1 text-muted">{serverLocalize(locale, "Permintaan booking dikonfirmasi setelah detail dan pembayaran diperiksa oleh tim.", "Booking requests are confirmed after the team reviews the details and payment.")}</p></div></div>
          </section>
        </div>
      </div>
    </main>

    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-18px_50px_-34px_rgba(0,0,0,0.55)] lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4"><div className="min-w-0"><p className="truncate text-xs text-muted">{serverLocalize(locale, "Mulai dari", "From")}</p><p className="truncate font-bold tabular-nums">{formatMoney(room.price_per_night, locale)}<span className="ml-1 text-xs font-normal text-muted">/{serverLocalize(locale, "malam", "night")}</span></p></div><Link href={reservationHref} className="flex min-h-12 shrink-0 items-center justify-center rounded-sm bg-primary px-5 text-sm font-bold text-background">{canBook ? serverLocalize(locale, "Pesan sekarang", "Book now") : serverLocalize(locale, "Cek tanggal", "Check dates")}</Link></div>
    </div>

  </div>;
}
