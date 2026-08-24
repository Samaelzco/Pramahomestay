"use client";

import { createGuestAction, updateGuestAction } from "@/app/internal/(dashboard)/guests/actions";
import type { ActionState, Guest } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";
import Link from "next/link";
import { useActionState } from "react";

function FieldError({ errors }: { errors?: string[] }) { return errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{error}</p>); }

export function GuestForm({ guest }: { guest?: Guest }) {
  const locale = useLocale();
  const action = guest ? updateGuestAction.bind(null, guest.id) : createGuestAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return <form action={formAction} className="mt-10 max-w-4xl">
    {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{state.message}</div>}
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Kontak utama", "Primary contact")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Identitas kontak yang digunakan saat membuat booking baru.", "Contact details used when creating a new booking.")}</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Nama lengkap", "Full name")}<input name="full_name" required maxLength={120} defaultValue={guest?.full_name} placeholder={localize(locale, "Nama sesuai identitas", "Name as shown on ID")} className={inputClass} /><FieldError errors={state.errors?.full_name} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Nomor telepon", "Phone number")}<input name="phone" required maxLength={30} defaultValue={guest?.phone} placeholder="+62 812 3456 7890" className={inputClass} /><FieldError errors={state.errors?.phone} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase sm:col-span-2">Email<input name="email" type="email" required maxLength={255} defaultValue={guest?.email} placeholder="nama@email.com" className={inputClass} /><FieldError errors={state.errors?.email} /></label>
    </div></section>
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Informasi tambahan", "Additional information")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Simpan hanya informasi yang membantu pelayanan dan komunikasi.", "Only save information that helps service and communication.")}</p></div><div className="grid gap-6">
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Alamat", "Address")}<textarea name="address" maxLength={1000} defaultValue={guest?.address ?? ""} rows={3} placeholder={localize(locale, "Alamat domisili atau penjemputan", "Home or pickup address")} className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary" /><FieldError errors={state.errors?.address} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Catatan internal", "Internal notes")}<textarea name="notes" maxLength={2000} defaultValue={guest?.notes ?? ""} rows={3} placeholder={localize(locale, "Preferensi komunikasi atau informasi pelayanan", "Communication preferences or service information")} className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary" /><FieldError errors={state.errors?.notes} /></label>
    </div></section>
    {guest && <p className="border-t py-5 text-sm leading-6 text-muted">{localize(locale, "Perubahan profil berlaku untuk booking berikutnya. Snapshot kontak pada booking lama tetap dipertahankan.", "Profile changes apply to future bookings. Contact snapshots on past bookings remain unchanged.")}</p>}
    <div className="flex flex-col-reverse gap-3 border-t py-8 sm:flex-row sm:justify-end"><Link href={guest ? `/internal/guests/${guest.id}` : "/internal/guests"} className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-low">{localize(locale, "Batal", "Cancel")}</Link><button disabled={pending} className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">{pending ? localize(locale, "Menyimpan…", "Saving…") : guest ? localize(locale, "Simpan perubahan", "Save changes") : localize(locale, "Tambahkan tamu", "Add guest")}</button></div>
  </form>;
}
