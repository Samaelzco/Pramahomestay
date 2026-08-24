"use client";

import {
  createBookingAction,
  searchGuestOptionsAction,
  updateBookingAction,
} from "@/app/internal/(dashboard)/bookings/actions";
import type {
  ActionState,
  Booking,
  GuestReference,
  Room,
} from "@/lib/api/types";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import Link from "next/link";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

const statuses = [
  { value: "pending", id: "Menunggu", en: "Pending" },
  { value: "confirmed", id: "Dikonfirmasi", en: "Confirmed" },
  { value: "checked_in", id: "Check-in", en: "Checked in" },
  { value: "checked_out", id: "Check-out", en: "Checked out" },
];

function FieldError({ errors }: { errors?: string[] }) {
  const locale = useLocale();
  return errors?.map((error) => (
    <p key={error} className="mt-2 text-sm text-danger">
      {localizeApiMessage(locale, error)}
    </p>
  ));
}

export function BookingForm({
  rooms,
  guests,
  booking,
  initialGuestId,
}: {
  rooms: Room[];
  guests: GuestReference[];
  booking?: Booking;
  initialGuestId?: string;
}) {
  const locale = useLocale();
  const currency = new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
  const action = booking
    ? updateBookingAction.bind(null, booking.id)
    : createBookingAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {},
  );
  const [roomId, setRoomId] = useState(
    String(booking?.room.id ?? rooms[0]?.id ?? ""),
  );
  const [guestId, setGuestId] = useState(
    String(booking?.guest?.id ?? initialGuestId ?? guests[0]?.id ?? ""),
  );
  const [guestQuery, setGuestQuery] = useState("");
  const [guestOptions, setGuestOptions] = useState<GuestReference[]>(() => {
    const selected = booking?.guest;
    return selected && !guests.some((item) => item.id === selected.id)
      ? [selected, ...guests]
      : guests;
  });
  const [searchingGuests, startGuestSearch] = useTransition();
  const [checkIn, setCheckIn] = useState(booking?.check_in ?? "");
  const [checkOut, setCheckOut] = useState(booking?.check_out ?? "");
  const room =
    rooms.find((item) => String(item.id) === roomId) ?? booking?.room;
  const guest =
    guestOptions.find((item) => String(item.id) === guestId) ?? booking?.guest;
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      startGuestSearch(async () => {
        const results = await searchGuestOptionsAction(guestQuery);
        if (!active || results.length === 0) return;
        setGuestOptions((current) => {
          const selected = current.find((item) => String(item.id) === guestId);
          return selected && !results.some((item) => item.id === selected.id)
            ? [selected, ...results]
            : results;
        });
      });
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [guestId, guestQuery]);
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(
      0,
      Math.round(
        (new Date(`${checkOut}T00:00:00`).getTime() -
          new Date(`${checkIn}T00:00:00`).getTime()) /
          86_400_000,
      ),
    );
  }, [checkIn, checkOut]);
  const estimate = Number(room?.price_per_night ?? 0) * nights;
  const inputClass =
    "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return (
    <form action={formAction} className="mt-10 max-w-5xl">
      {state.message && (
        <div
          role="alert"
          className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]"
        >
          {localizeApiMessage(locale, state.message)}
        </div>
      )}
      <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
        <div>
          <h2 className="text-lg font-semibold">
            {localize(locale, "Data tamu", "Guest details")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {localize(
              locale,
              "Kontak utama yang dapat dihubungi terkait reservasi.",
              "The primary contact for this reservation.",
            )}
          </p>
        </div>
        <div>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {localize(locale, "Cari tamu", "Search guests")}
            <input
              type="search"
              value={guestQuery}
              onChange={(event) => setGuestQuery(event.target.value)}
              placeholder={localize(
                locale,
                "Nama, email, atau nomor telepon",
                "Name, email, or phone number",
              )}
              className={inputClass}
            />
          </label>
          <p aria-live="polite" className="mt-2 text-xs text-muted">
            {searchingGuests
              ? localize(locale, "Mencari profil…", "Searching profiles…")
              : localize(
                  locale,
                  `${guestOptions.length} pilihan ditampilkan`,
                  `${guestOptions.length} ${guestOptions.length === 1 ? "option" : "options"} shown`,
                )}
          </p>
          <label className="mt-5 block text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {localize(locale, "Pilih tamu", "Select guest")}
            <select
              name="guest_id"
              required
              value={guestId}
              onChange={(event) => setGuestId(event.target.value)}
              className={inputClass}
            >
              {guestOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.full_name} · {item.phone}
                </option>
              ))}
            </select>
            <FieldError errors={state.errors?.guest_id} />
          </label>
          {guest && (
            <div className="mt-4 rounded-sm bg-surface-low p-4 text-sm">
              <p className="font-semibold">{guest.full_name}</p>
              <p className="mt-1 break-all text-muted">
                {guest.email} · {guest.phone}
              </p>
            </div>
          )}
          <Link
            href="/internal/guests/new"
            className="mt-4 inline-flex min-h-12 items-center text-sm font-semibold text-secondary underline-offset-4 hover:underline"
          >
            {localize(
              locale,
              "Tamu belum terdaftar? Tambah profil",
              "Guest not registered? Add a profile",
            )}
          </Link>
        </div>
      </section>
      <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
        <div>
          <h2 className="text-lg font-semibold">
            {localize(locale, "Rencana menginap", "Stay plan")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {localize(
              locale,
              "Kamar, tanggal, dan jumlah tamu akan diperiksa terhadap ketersediaan.",
              "The room, dates, and guest count will be checked against availability.",
            )}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">
            {localize(locale, "Kamar", "Room")}
            <select
              name="room_id"
              required
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              className={inputClass}
            >
              {rooms.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ·{" "}
                  {localize(
                    locale,
                    `maks. ${item.capacity} tamu`,
                    `max. ${item.capacity} ${item.capacity === 1 ? "guest" : "guests"}`,
                  )}
                </option>
              ))}
            </select>
            <FieldError errors={state.errors?.room_id} />
          </label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {localize(locale, "Check-in · TT/BB/TTTT", "Check-in · DD/MM/YYYY")}
            <input
              name="check_in"
              type="date"
              required
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              className={inputClass}
            />
            <FieldError errors={state.errors?.check_in} />
          </label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {localize(locale, "Check-out · TT/BB/TTTT", "Check-out · DD/MM/YYYY")}
            <input
              name="check_out"
              type="date"
              required
              min={checkIn || undefined}
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              className={inputClass}
            />
            <FieldError errors={state.errors?.check_out} />
          </label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {localize(locale, "Jumlah tamu", "Guest count")}
            <input
              name="guest_count"
              type="number"
              min="1"
              max={room?.capacity ?? 20}
              required
              defaultValue={booking?.guest_count ?? 2}
              className={inputClass}
            />
            <FieldError errors={state.errors?.guest_count} />
          </label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            Status
            <select
              name="status"
              required
              defaultValue={booking?.status ?? "pending"}
              className={inputClass}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {localize(locale, status.id, status.en)}
                </option>
              ))}
              {booking?.status === "cancelled" && (
                <option value="cancelled">
                  {localize(locale, "Dibatalkan", "Cancelled")}
                </option>
              )}
            </select>
            <FieldError errors={state.errors?.status} />
          </label>
          <div
            key={`${roomId}-${nights}`}
            className="booking-estimate-feedback sm:col-span-2 grid gap-3 rounded-lg bg-primary p-5 text-white sm:grid-cols-3 sm:p-6"
          >
            <div>
              <p className="text-xs text-white/65">
                {localize(locale, "Tarif kamar", "Room rate")}
              </p>
              <p className="mt-1 font-semibold tabular-nums">
                {currency.format(Number(room?.price_per_night ?? 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/65">
                {localize(locale, "Durasi", "Duration")}
              </p>
              <p className="mt-1 font-semibold tabular-nums">
                {nights > 0
                  ? `${nights} ${localize(locale, "malam", nights === 1 ? "night" : "nights")}`
                  : localize(locale, "Pilih tanggal", "Select dates")}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/65">
                {localize(locale, "Estimasi total", "Estimated total")}
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {nights > 0 ? currency.format(estimate) : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
        <div>
          <h2 className="text-lg font-semibold">
            {localize(locale, "Catatan", "Notes")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {localize(
              locale,
              "Pisahkan permintaan tamu dari informasi khusus tim internal.",
              "Keep guest requests separate from internal team information.",
            )}
          </p>
        </div>
        <div className="grid gap-6">
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {localize(locale, "Permintaan khusus", "Special requests")}
            <textarea
              name="special_requests"
              maxLength={2000}
              defaultValue={booking?.special_requests ?? ""}
              rows={3}
              placeholder={localize(
                locale,
                "Contoh: kamar jauh dari tangga",
                "Example: room away from the stairs",
              )}
              className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary"
            />
            <FieldError errors={state.errors?.special_requests} />
          </label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {localize(locale, "Catatan internal", "Internal notes")}
            <textarea
              name="internal_notes"
              maxLength={2000}
              defaultValue={booking?.internal_notes ?? ""}
              rows={3}
              placeholder={localize(
                locale,
                "Hanya terlihat oleh admin dan staff",
                "Visible only to admins and staff",
              )}
              className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary"
            />
            <FieldError errors={state.errors?.internal_notes} />
          </label>
        </div>
      </section>
      <div className="flex flex-col gap-3 border-t py-8 sm:flex-row sm:justify-end">
        <Link
          href={
            booking ? `/internal/bookings/${booking.id}` : "/internal/bookings"
          }
          className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-low"
        >
          {localize(locale, "Batal", "Cancel")}
        </Link>
        <button
          disabled={pending || rooms.length === 0}
          type="submit"
          className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60"
        >
          {pending
            ? localize(locale, "Menyimpan…", "Saving…")
            : booking
              ? localize(locale, "Simpan perubahan", "Save changes")
              : localize(locale, "Tambahkan booking", "Add booking")}
        </button>
      </div>
    </form>
  );
}
