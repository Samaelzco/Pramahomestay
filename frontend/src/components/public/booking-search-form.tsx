"use client";

import { nextDate } from "@/lib/date";
import { localize, type Locale } from "@/lib/locale";
import { useState, type FormEvent } from "react";

type Props = {
  today: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  locale: Locale;
};

export function BookingSearchForm({ today, checkIn, checkOut, guests, locale }: Props) {
  const [arrival, setArrival] = useState(checkIn);
  const [departure, setDeparture] = useState(checkOut);
  const minimumDeparture = nextDate(arrival || today);

  function updateArrival(value: string) {
    setArrival(value);
    const nextMinimum = nextDate(value || today);
    if (departure && nextMinimum && departure < nextMinimum) setDeparture("");
  }

  function validate(event: FormEvent<HTMLFormElement>) {
    const departureInput = event.currentTarget.elements.namedItem("check_out") as HTMLInputElement;
    departureInput.setCustomValidity("");
    if (arrival && departure <= arrival) {
      event.preventDefault();
      departureInput.setCustomValidity(localize(locale, "Tanggal pulang minimal satu hari setelah tanggal datang.", "Departure must be at least one day after arrival."));
      departureInput.reportValidity();
    }
  }

  return <form action="/booking" onSubmit={validate} className="mt-12 grid gap-4 bg-surface p-5 shadow-[0_22px_60px_-45px_rgba(0,0,0,0.45)] sm:grid-cols-2 sm:p-7 lg:grid-cols-[1fr_1fr_0.65fr_auto]">
    <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Tanggal datang", "Arrival date")}<input required type="date" name="check_in" min={today} value={arrival} onChange={(event) => updateArrival(event.target.value)} className="mt-2 h-13 w-full border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none focus:border-primary" /></label>
    <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Tanggal pulang", "Departure date")}<input required type="date" name="check_out" min={minimumDeparture} value={departure} onChange={(event) => setDeparture(event.target.value)} className="mt-2 h-13 w-full border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none focus:border-primary" /></label>
    <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Tamu", "Guests")}<select name="guests" defaultValue={guests} className="mt-2 h-13 w-full border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none focus:border-primary">{[1,2,3,4,5,6].map((count) => <option key={count} value={count}>{count} {localize(locale, "tamu", count === 1 ? "guest" : "guests")}</option>)}</select></label>
    <button className="h-13 self-end bg-primary px-7 text-sm font-bold text-background">{localize(locale, "Cari kamar", "Search rooms")}</button>
  </form>;
}
