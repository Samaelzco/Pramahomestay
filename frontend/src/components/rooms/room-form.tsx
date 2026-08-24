"use client";

import { createRoomAction, updateRoomAction } from "@/app/internal/(dashboard)/rooms/actions";
import type { ActionState, Amenity, Room } from "@/lib/api/types";
import { amenityName, localize, useLocale } from "@/lib/locale";
import Link from "next/link";
import { useActionState } from "react";
import { RoomImageInput } from "./room-image-input";

const statuses = [{ value: "ready", id: "Siap", en: "Ready" }, { value: "occupied", id: "Terisi", en: "Occupied" }, { value: "cleaning", id: "Dibersihkan", en: "Cleaning" }, { value: "maintenance", id: "Perawatan", en: "Maintenance" }];

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{error}</p>);
}

export function RoomForm({ room, amenities }: { room?: Room; amenities: Amenity[] }) {
  const locale = useLocale();
  const action = room ? updateRoomAction.bind(null, room.id) : createRoomAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none transition-colors focus:border-primary";
  const imageErrors = Object.entries(state.errors ?? {}).filter(([key]) => key === "images" || key.startsWith("images.")).flatMap(([, messages]) => messages);

  return (
    <form action={formAction} className="mt-10 max-w-4xl">
      {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{state.message}</div>}
      <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
        <div><h2 className="text-lg font-semibold">{localize(locale, "Identitas kamar", "Room identity")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Nama unit dan uraian yang dikenali tim.", "The unit name and descriptions used by the team.")}</p></div>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">{localize(locale, "Nama unit", "Unit name")}<input name="name" required maxLength={100} defaultValue={room?.name} placeholder={localize(locale, "Contoh: Unit 301", "Example: Unit 301")} className={inputClass} /><FieldError errors={state.errors?.name} /></label>
          <label className="sm:col-span-2 text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Deskripsi · Indonesia", "Description · Indonesian")}<textarea name="description" maxLength={2000} defaultValue={room?.description ?? ""} rows={4} placeholder="Jelaskan karakter dan keunggulan kamar." lang="id" className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-primary" /><FieldError errors={state.errors?.description} /></label>
          <label className="sm:col-span-2 text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Deskripsi · Inggris", "Description · English")} <span className="font-normal normal-case">({localize(locale, "opsional", "optional")})</span><textarea name="description_en" maxLength={2000} defaultValue={room?.description_en ?? ""} rows={4} placeholder="Describe the room's character and highlights." lang="en" className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-primary" /><FieldError errors={state.errors?.description_en} /></label>
        </div>
      </section>
      <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
        <div><h2 className="text-lg font-semibold">{localize(locale, "Harga & kapasitas", "Price & capacity")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Informasi dasar untuk ketersediaan dan pemesanan.", "Core information for availability and bookings.")}</p></div>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Harga per malam (Rp)", "Price per night (IDR)")}<input name="price_per_night" type="number" min="0" step="1000" required defaultValue={room ? Number(room.price_per_night) : 650000} className={inputClass} /><FieldError errors={state.errors?.price_per_night} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Kapasitas tamu", "Guest capacity")}<input name="capacity" type="number" min="1" max="20" required defaultValue={room?.capacity ?? 2} className={inputClass} /><FieldError errors={state.errors?.capacity} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Jumlah tempat tidur", "Number of beds")}<input name="bed_count" type="number" min="1" max="10" required defaultValue={room?.bed_count ?? 1} className={inputClass} /><FieldError errors={state.errors?.bed_count} /></label>
        </div>
      </section>
      <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
        <div><h2 className="text-lg font-semibold">{localize(locale, "Operasional & fasilitas", "Operations & amenities")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Kondisi terkini, foto, dan fasilitas utama.", "Current condition, photos, and main amenities.")}</p></div>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Status<select name="status" required defaultValue={room?.status ?? "ready"} className={inputClass}>{statuses.map((status) => <option key={status.value} value={status.value}>{localize(locale, status.id, status.en)}</option>)}</select><FieldError errors={state.errors?.status} /></label>
          <fieldset className="sm:col-span-2"><legend className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Fasilitas kamar", "Room amenities")}</legend><input type="hidden" name="amenity_ids_present" value="1" />{amenities.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{amenities.map((amenity) => { const selected = room?.amenities.some((item) => item.id === amenity.id) ?? false; return <label key={amenity.id} className={`flex min-h-14 items-start gap-3 rounded-sm border px-4 py-3 text-sm ${!amenity.is_active && !selected ? "cursor-not-allowed bg-surface-low text-muted" : "bg-surface"}`}><input type="checkbox" name="amenity_ids[]" value={amenity.id} defaultChecked={selected} disabled={!amenity.is_active && !selected} className="mt-0.5 size-4 accent-secondary" /><span><span className="font-semibold">{amenityName(amenity, locale)}</span>{!amenity.is_active && <span className="mt-1 block text-xs text-muted">{localize(locale, "Nonaktif", "Inactive")}</span>}</span></label>; })}</div> : <div className="mt-3 rounded-sm bg-surface-low p-4 text-sm text-muted">{localize(locale, "Belum ada fasilitas.", "No amenities yet.")} <Link href="/internal/amenities/new" className="font-semibold text-secondary underline-offset-4 hover:underline">{localize(locale, "Tambah fasilitas", "Add an amenity")}</Link> {localize(locale, "terlebih dahulu.", "first.")}</div>}<FieldError errors={state.errors?.amenity_ids} /></fieldset>
          <RoomImageInput currentImages={room?.images} errors={imageErrors} />
          <label className="sm:col-span-2 flex items-start gap-3 rounded-sm bg-surface-low p-4 text-sm"><input name="is_active" type="checkbox" defaultChecked={room?.is_active ?? true} className="mt-0.5 size-4 accent-secondary" /><span><span className="block font-semibold">{localize(locale, "Kamar aktif", "Active room")}</span><span className="mt-1 block leading-6 text-muted">{localize(locale, "Kamar dapat digunakan dalam alur operasional dan pemesanan.", "The room can be used in operational and booking workflows.")}</span></span></label>
        </div>
      </section>
      <div className="flex flex-col-reverse gap-3 border-t py-8 sm:flex-row sm:justify-end">
        <Link href="/internal/rooms" className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-low">{localize(locale, "Batal", "Cancel")}</Link>
        <button disabled={pending} type="submit" className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">{pending ? localize(locale, "Menyimpan…", "Saving…") : room ? localize(locale, "Simpan perubahan", "Save changes") : localize(locale, "Tambahkan kamar", "Add room")}</button>
      </div>
    </form>
  );
}
