import { BookingFlowHeader } from "@/components/public/booking-flow-header";
import { BookingProgress } from "@/components/public/booking-progress";
import { PublicBookingForm } from "@/components/public/public-booking-form";
import { ArrowLeftIcon, BedIcon, CalendarIcon, CheckIcon, UsersIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, PublicLandingData, PublicRoom } from "@/lib/api/types";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking", description: "Pilih tanggal, kamar, dan kirim permintaan booking Prama Homestay." };

type PageProps = { searchParams: Promise<{ check_in?: string; check_out?: string; guests?: string; room_id?: string }> };

function money(value: string, locale: "id" | "en") {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
}

function roomDescription(room: PublicRoom, locale: "id" | "en") {
  return locale === "en" && room.description_en?.trim() ? room.description_en : room.description;
}

export default async function BookingPage({ searchParams }: PageProps) {
  const locale = await serverLocale();
  const params = await searchParams;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar" }).format(new Date());
  const checkIn = /^\d{4}-\d{2}-\d{2}$/.test(params.check_in ?? "") && params.check_in! >= today ? params.check_in! : "";
  const checkOut = /^\d{4}-\d{2}-\d{2}$/.test(params.check_out ?? "") && params.check_out! > checkIn ? params.check_out! : "";
  const guestValue = Number(params.guests);
  const guests = Number.isInteger(guestValue) && guestValue >= 1 && guestValue <= 20 ? guestValue : 1;
  const hasDates = Boolean(checkIn && checkOut);
  const query = new URLSearchParams({ guests: String(guests) });
  if (hasDates) { query.set("check_in", checkIn); query.set("check_out", checkOut); }
  const { data } = await apiFetch<ApiItem<PublicLandingData>>(`/public/landing?${query}`, {}, false);
  const selectedRoom = hasDates ? data.rooms.find((room) => room.id === Number(params.room_id)) : undefined;
  const currentStep: 1 | 2 | 3 | 4 = selectedRoom ? 3 : hasDates ? 2 : 1;
  const nights = hasDates ? Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000) : 0;
  const keepQuery = new URLSearchParams({ check_in: checkIn, check_out: checkOut, guests: String(guests) });

  return <div className="booking-page min-h-screen bg-surface-low text-foreground">
    <BookingFlowHeader propertyName={data.property.name} locale={locale} />

    <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />{serverLocalize(locale, "Kembali ke beranda", "Back to home")}</Link>
      <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-end"><div><p className="text-xs font-semibold tracking-[0.14em] text-secondary uppercase">{serverLocalize(locale, "Reservasi langsung", "Direct reservation")}</p><h1 className="mt-4 max-w-[13ch] text-balance text-[clamp(2.65rem,4.5vw,4.7rem)] leading-[0.96] font-semibold tracking-[-0.04em]">{serverLocalize(locale, "Pilih waktu dan ruang untuk menginap.", "Choose your dates and space to stay.")}</h1></div><BookingProgress current={currentStep} locale={locale} /></div>

      <form action="/booking" className="mt-12 grid gap-4 bg-surface p-5 shadow-[0_22px_60px_-45px_rgba(0,0,0,0.45)] sm:grid-cols-2 sm:p-7 lg:grid-cols-[1fr_1fr_0.65fr_auto]">
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{serverLocalize(locale, "Tanggal datang", "Arrival date")}<input required type="date" name="check_in" min={today} defaultValue={checkIn} className="mt-2 h-13 w-full border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none focus:border-primary" /></label>
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{serverLocalize(locale, "Tanggal pulang", "Departure date")}<input required type="date" name="check_out" min={checkIn || today} defaultValue={checkOut} className="mt-2 h-13 w-full border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none focus:border-primary" /></label>
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{serverLocalize(locale, "Tamu", "Guests")}<select name="guests" defaultValue={guests} className="mt-2 h-13 w-full border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none focus:border-primary">{[1,2,3,4,5,6].map((count) => <option key={count} value={count}>{count} {serverLocalize(locale, "tamu", "guests")}</option>)}</select></label>
        <button className="h-13 self-end bg-primary px-7 text-sm font-bold text-background">{serverLocalize(locale, "Cari kamar", "Search rooms")}</button>
      </form>

      {!hasDates ? <section className="mt-8 grid min-h-80 place-items-center bg-background px-6 py-16 text-center"><div><CalendarIcon className="mx-auto size-10 text-secondary" /><h2 className="mt-6 text-2xl font-semibold">{serverLocalize(locale, "Tentukan tanggal menginap", "Choose your stay dates")}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-muted">{serverLocalize(locale, "Kamar yang tersedia dan total harga akan muncul setelah tanggal dipilih.", "Available rooms and estimated totals will appear after you select dates.")}</p></div></section> : <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_26rem] xl:items-start">
        <section>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold tracking-[0.12em] text-secondary uppercase">{serverLocalize(locale, "Kamar tersedia", "Available rooms")}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{data.rooms.length} {serverLocalize(locale, "pilihan", "options")}</h2></div><p className="text-sm text-muted">{checkIn} → {checkOut} · {nights} {serverLocalize(locale, "malam", "nights")}</p></div>
          {data.rooms.length ? <div className="mt-6 grid gap-5 lg:grid-cols-2">{data.rooms.map((room) => {
            const hrefQuery = new URLSearchParams(keepQuery); hrefQuery.set("room_id", String(room.id));
            const isSelected = selectedRoom?.id === room.id;
            return <article key={room.id} className={`overflow-hidden bg-background transition-shadow ${isSelected ? "ring-2 ring-secondary shadow-[0_22px_60px_-42px_rgba(0,0,0,0.55)]" : ""}`} aria-label={`${room.name}${isSelected ? ` · ${serverLocalize(locale, "dipilih", "selected")}` : ""}`}>
              <div className="relative aspect-[16/10] bg-surface-high">{room.images[0] && <Image src={room.images[0].url} alt={room.name} fill sizes="(min-width: 1024px) 35vw, 100vw" className="object-cover" />}{isSelected && <span className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-secondary text-white"><CheckIcon className="size-5" /></span>}</div>
              <div className="p-6"><div className="flex items-start justify-between gap-5"><div><h3 className="text-2xl font-semibold">{room.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{roomDescription(room, locale)}</p></div><p className="shrink-0 text-right font-bold">{money(room.price_per_night, locale)}<span className="block text-xs font-normal text-muted">/{serverLocalize(locale, "malam", "night")}</span></p></div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted"><span className="inline-flex items-center gap-2"><UsersIcon className="size-4" />{room.capacity} {serverLocalize(locale, "tamu", "guests")}</span><span className="inline-flex items-center gap-2"><BedIcon className="size-4" />{room.bed_count} {serverLocalize(locale, "tempat tidur", "beds")}</span></div>
                <div className="mt-5 flex flex-wrap gap-2">{room.amenities.slice(0, 4).map((amenity) => <span key={amenity.id} className="bg-surface-low px-3 py-1.5 text-xs text-muted">{locale === "en" && amenity.name_en ? amenity.name_en : amenity.name}</span>)}</div>
                <Link href={`/booking?${hrefQuery}#guest-details`} className={`mt-6 flex min-h-12 items-center justify-center px-5 text-sm font-bold ${isSelected ? "bg-secondary-soft text-secondary" : "bg-primary text-background"}`}>{isSelected ? serverLocalize(locale, "Kamar dipilih", "Room selected") : serverLocalize(locale, "Pilih kamar", "Select room")}</Link>
              </div>
            </article>;
          })}</div> : <div className="mt-6 bg-background p-10"><h3 className="text-2xl font-semibold">{serverLocalize(locale, "Tidak ada kamar yang tersedia", "No rooms available")}</h3><p className="mt-3 text-muted">{serverLocalize(locale, "Coba tanggal lain atau kurangi jumlah tamu.", "Try different dates or reduce the guest count.")}</p></div>}
        </section>
        <aside id="guest-details" className={`${selectedRoom ? "order-first scroll-mt-24 xl:order-none" : ""} xl:sticky xl:top-28`}>{selectedRoom ? <><div className="mb-4 bg-background p-6"><p className="text-xs font-semibold tracking-[0.1em] text-secondary uppercase">{serverLocalize(locale, "Ringkasan", "Summary")}</p><div className="mt-4 flex justify-between gap-4"><div><p className="font-semibold">{selectedRoom.name}</p><p className="mt-1 text-sm text-muted">{nights} {serverLocalize(locale, "malam", "nights")} · {guests} {serverLocalize(locale, "tamu", "guests")}</p></div><p className="font-bold">{money(String(Number(selectedRoom.price_per_night) * nights), locale)}</p></div></div><PublicBookingForm room={selectedRoom} checkIn={checkIn} checkOut={checkOut} guests={guests} locale={locale} /></> : <div className="bg-background p-7"><p className="text-sm leading-6 text-muted">{serverLocalize(locale, "Pilih salah satu kamar untuk melanjutkan ke data pemesan.", "Select a room to continue to guest details.")}</p></div>}</aside>
      </div>}
    </main>
  </div>;
}
