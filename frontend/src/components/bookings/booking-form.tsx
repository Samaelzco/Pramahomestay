"use client";

import { createBookingAction, searchGuestOptionsAction, updateBookingAction } from "@/app/internal/(dashboard)/bookings/actions";
import type { ActionState, Booking, GuestReference, Room } from "@/lib/api/types";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";

const statuses = [["pending", "Menunggu"], ["confirmed", "Dikonfirmasi"], ["checked_in", "Check-in"], ["checked_out", "Check-out"]];
const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{error}</p>);
}

export function BookingForm({ rooms, guests, booking, initialGuestId }: { rooms: Room[]; guests: GuestReference[]; booking?: Booking; initialGuestId?: string }) {
  const action = booking ? updateBookingAction.bind(null, booking.id) : createBookingAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const [roomId, setRoomId] = useState(String(booking?.room.id ?? rooms[0]?.id ?? ""));
  const [guestId, setGuestId] = useState(String(booking?.guest?.id ?? initialGuestId ?? guests[0]?.id ?? ""));
  const [guestQuery, setGuestQuery] = useState("");
  const [guestOptions, setGuestOptions] = useState<GuestReference[]>(() => {
    const selected = booking?.guest;
    return selected && !guests.some((item) => item.id === selected.id) ? [selected, ...guests] : guests;
  });
  const [searchingGuests, startGuestSearch] = useTransition();
  const [checkIn, setCheckIn] = useState(booking?.check_in ?? "");
  const [checkOut, setCheckOut] = useState(booking?.check_out ?? "");
  const room = rooms.find((item) => String(item.id) === roomId) ?? booking?.room;
  const guest = guestOptions.find((item) => String(item.id) === guestId) ?? booking?.guest;
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      startGuestSearch(async () => {
        const results = await searchGuestOptionsAction(guestQuery);
        if (!active || results.length === 0) return;
        setGuestOptions((current) => {
          const selected = current.find((item) => String(item.id) === guestId);
          return selected && !results.some((item) => item.id === selected.id) ? [selected, ...results] : results;
        });
      });
    }, 300);
    return () => { active = false; window.clearTimeout(timer); };
  }, [guestId, guestQuery]);
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.round((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86_400_000));
  }, [checkIn, checkOut]);
  const estimate = Number(room?.price_per_night ?? 0) * nights;
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return (
    <form action={formAction} className="mt-10 max-w-5xl">
      {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{state.message}</div>}
      <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
        <div><h2 className="text-lg font-semibold">Data tamu</h2><p className="mt-2 text-sm leading-6 text-muted">Kontak utama yang dapat dihubungi terkait reservasi.</p></div>
        <div><label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Cari tamu<input type="search" value={guestQuery} onChange={(event) => setGuestQuery(event.target.value)} placeholder="Nama, email, atau nomor telepon" className={inputClass} /></label><p aria-live="polite" className="mt-2 text-xs text-muted">{searchingGuests ? "Mencari profil…" : `${guestOptions.length} pilihan ditampilkan`}</p><label className="mt-5 block text-xs font-semibold tracking-[0.08em] text-muted uppercase">Pilih tamu<select name="guest_id" required value={guestId} onChange={(event) => setGuestId(event.target.value)} className={inputClass}>{guestOptions.map((item) => <option key={item.id} value={item.id}>{item.full_name} · {item.phone}</option>)}</select><FieldError errors={state.errors?.guest_id} /></label>{guest && <div className="mt-4 rounded-sm bg-surface-low p-4 text-sm"><p className="font-semibold">{guest.full_name}</p><p className="mt-1 break-all text-muted">{guest.email} · {guest.phone}</p></div>}<Link href="/internal/guests/new" className="mt-4 inline-flex min-h-12 items-center text-sm font-semibold text-secondary underline-offset-4 hover:underline">Tamu belum terdaftar? Tambah profil</Link></div>
      </section>
      <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
        <div><h2 className="text-lg font-semibold">Rencana menginap</h2><p className="mt-2 text-sm leading-6 text-muted">Kamar, tanggal, dan jumlah tamu akan diperiksa terhadap ketersediaan.</p></div>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">Kamar<select name="room_id" required value={roomId} onChange={(event) => setRoomId(event.target.value)} className={inputClass}>{rooms.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.type_label} · maks. {item.capacity} tamu</option>)}</select><FieldError errors={state.errors?.room_id} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Check-in · TT/BB/TTTT<input name="check_in" type="date" required value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className={inputClass} /><FieldError errors={state.errors?.check_in} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Check-out · TT/BB/TTTT<input name="check_out" type="date" required min={checkIn || undefined} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className={inputClass} /><FieldError errors={state.errors?.check_out} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Jumlah tamu<input name="guest_count" type="number" min="1" max={room?.capacity ?? 20} required defaultValue={booking?.guest_count ?? 2} className={inputClass} /><FieldError errors={state.errors?.guest_count} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Status<select name="status" required defaultValue={booking?.status ?? "pending"} className={inputClass}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}{booking?.status === "cancelled" && <option value="cancelled">Dibatalkan</option>}</select><FieldError errors={state.errors?.status} /></label>
          <div key={`${roomId}-${nights}`} className="booking-estimate-feedback sm:col-span-2 grid gap-3 rounded-lg bg-primary p-5 text-white sm:grid-cols-3 sm:p-6">
            <div><p className="text-xs text-white/65">Tarif kamar</p><p className="mt-1 font-semibold tabular-nums">{currency.format(Number(room?.price_per_night ?? 0))}</p></div>
            <div><p className="text-xs text-white/65">Durasi</p><p className="mt-1 font-semibold tabular-nums">{nights > 0 ? `${nights} malam` : "Pilih tanggal"}</p></div>
            <div><p className="text-xs text-white/65">Estimasi total</p><p className="mt-1 text-lg font-semibold tabular-nums">{nights > 0 ? currency.format(estimate) : "—"}</p></div>
          </div>
        </div>
      </section>
      <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
        <div><h2 className="text-lg font-semibold">Catatan</h2><p className="mt-2 text-sm leading-6 text-muted">Pisahkan permintaan tamu dari informasi khusus tim internal.</p></div>
        <div className="grid gap-6">
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Permintaan khusus<textarea name="special_requests" maxLength={2000} defaultValue={booking?.special_requests ?? ""} rows={3} placeholder="Contoh: kamar jauh dari tangga" className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary" /><FieldError errors={state.errors?.special_requests} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Catatan internal<textarea name="internal_notes" maxLength={2000} defaultValue={booking?.internal_notes ?? ""} rows={3} placeholder="Hanya terlihat oleh admin dan staff" className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary" /><FieldError errors={state.errors?.internal_notes} /></label>
        </div>
      </section>
      <div className="flex flex-col gap-3 border-t py-8 sm:flex-row sm:justify-end">
        <Link href={booking ? `/internal/bookings/${booking.id}` : "/internal/bookings"} className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-low">Batal</Link>
        <button disabled={pending || rooms.length === 0} type="submit" className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">{pending ? "Menyimpan…" : booking ? "Simpan perubahan" : "Tambahkan booking"}</button>
      </div>
    </form>
  );
}
