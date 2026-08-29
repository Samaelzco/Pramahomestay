"use client";

import { createRoomBlockAction } from "@/app/internal/(dashboard)/availability/actions";
import type { ActionState, Room } from "@/lib/api/types";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import Link from "next/link";
import { useActionState, useState } from "react";

function FieldError({ errors }: { errors?: string[] }) {
  const locale = useLocale();
  return errors?.map((error) => <p key={error} className="mt-2 text-sm font-normal tracking-normal text-danger normal-case">{localizeApiMessage(locale, error)}</p>);
}

export function RoomBlockForm({ rooms, initialStart, initialRoomId }: { rooms: Room[]; initialStart: string; initialRoomId: number | null }) {
  const locale = useLocale();
  const [state, action, pending] = useActionState<ActionState, FormData>(createRoomBlockAction, {});
  const [start, setStart] = useState(initialStart);
  const nextDay = start ? new Date(`${start}T00:00:00Z`) : null;
  if (nextDay) nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const minimumEnd = nextDay?.toISOString().slice(0, 10) ?? "";
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10";

  return <form action={action} className="mt-10 max-w-4xl">
    {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</div>}
    <section className="grid gap-6 border-t py-8 lg:grid-cols-[220px_1fr]">
      <div><h2 className="text-lg font-semibold">{localize(locale, "Jadwal blok", "Block schedule")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Gunakan untuk perawatan, perbaikan, atau pemakaian internal.", "Use this for maintenance, repairs, or internal use.")}</p></div>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">{localize(locale, "Kamar", "Room")}<select name="room_id" required defaultValue={initialRoomId ?? ""} className={inputClass}><option value="">{localize(locale, "Pilih kamar", "Select a room")}</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}{!room.is_active ? ` · ${localize(locale, "nonaktif", "inactive")}` : ""}</option>)}</select><FieldError errors={state.errors?.room_id} /></label>
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Mulai", "Start")}<input name="start_date" type="date" required value={start} onChange={(event) => setStart(event.target.value)} className={inputClass} /><FieldError errors={state.errors?.start_date} /></label>
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Selesai", "End")}<input name="end_date" type="date" required min={minimumEnd} defaultValue={minimumEnd} key={minimumEnd} className={inputClass} /><p className="mt-2 text-xs font-normal leading-5 tracking-normal text-muted normal-case">{localize(locale, "Kamar tersedia kembali pada tanggal selesai.", "The room becomes available again on the end date.")}</p><FieldError errors={state.errors?.end_date} /></label>
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">{localize(locale, "Alasan", "Reason")}<input name="title" required maxLength={120} placeholder={localize(locale, "Contoh: Perawatan AC", "Example: AC maintenance")} className={inputClass} /><FieldError errors={state.errors?.title} /></label>
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">{localize(locale, "Catatan", "Notes")} <span className="font-normal normal-case">({localize(locale, "opsional", "optional")})</span><textarea name="notes" maxLength={1000} rows={4} placeholder={localize(locale, "Detail pekerjaan atau kebutuhan tim", "Work details or team requirements")} className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /><FieldError errors={state.errors?.notes} /></label>
      </div>
    </section>
    <div className="flex flex-col-reverse gap-3 border-t py-8 sm:flex-row sm:justify-end"><Link href="/internal/availability" className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold hover:bg-surface-low">{localize(locale, "Batal", "Cancel")}</Link><button type="submit" disabled={pending || rooms.length === 0} className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:cursor-not-allowed disabled:opacity-60">{pending ? localize(locale, "Menyimpan…", "Saving…") : localize(locale, "Blokir kamar", "Block room")}</button></div>
  </form>;
}
