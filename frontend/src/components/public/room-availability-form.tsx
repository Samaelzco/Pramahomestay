"use client";

import { nextDate } from "@/lib/date";
import { localize, type Locale } from "@/lib/locale";
import { useState, type FormEvent } from "react";

type Props = {
  roomId: number;
  today: string;
  maxGuests: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  locale: Locale;
};

export function RoomAvailabilityForm({ roomId, today, maxGuests, checkIn, checkOut, guests, locale }: Props) {
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

  return <form action={`/rooms/${roomId}`} onSubmit={validate} className="grid gap-4">
    <label className="public-field"><span>{localize(locale, "Tanggal datang", "Arrival date")}</span><input required type="date" name="check_in" min={today} value={arrival} onChange={(event) => updateArrival(event.target.value)} /></label>
    <label className="public-field"><span>{localize(locale, "Tanggal pulang", "Departure date")}</span><input required type="date" name="check_out" min={minimumDeparture} value={departure} onChange={(event) => setDeparture(event.target.value)} /></label>
    <label className="public-field"><span>{localize(locale, "Tamu", "Guests")}</span><select name="guests" defaultValue={guests}>{Array.from({ length: Math.max(1, maxGuests) }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {localize(locale, "tamu", count === 1 ? "guest" : "guests")}</option>)}</select></label>
    <button type="submit" className="mt-1 min-h-13 bg-primary px-6 text-sm font-bold text-background transition-transform hover:-translate-y-0.5">{localize(locale, "Cek ketersediaan", "Check availability")}</button>
  </form>;
}
