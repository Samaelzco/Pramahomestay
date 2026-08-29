"use client";

import { recoverPublicBookingAction } from "@/app/booking/status/actions";
import { SearchIcon, ShieldIcon } from "@/components/ui/icons";
import { localize, localizeApiMessage, type Locale } from "@/lib/locale";
import { useActionState } from "react";

function FieldError({ errors, locale }: { errors?: string[]; locale: Locale }) {
  return errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>);
}

export function PublicBookingRecoveryForm({ locale }: { locale: Locale }) {
  const [state, action, pending] = useActionState(recoverPublicBookingAction, {});
  const inputClass = "mt-2 h-13 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors hover:border-muted focus:border-primary";
  const labelClass = "text-xs font-semibold tracking-[0.08em] text-muted uppercase";

  return <form action={action} className="bg-surface p-6 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.45)] sm:p-9">
    <h2 className="text-2xl font-semibold tracking-[-0.03em]">{localize(locale, "Cari pesanan", "Find your booking")}</h2>
    <p className="mt-3 text-sm leading-6 text-muted">{localize(locale, "Masukkan kode booking serta email atau nomor telepon yang digunakan saat memesan.", "Enter your booking code and the email or phone number used for the reservation.")}</p>
    {state.message && <div role="alert" className="mt-6 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</div>}
    <div className="mt-7 grid gap-5">
      <label className={labelClass}>
        {localize(locale, "Kode booking", "Booking code")}
        <input name="booking_code" required minLength={4} maxLength={40} autoCapitalize="characters" autoComplete="off" placeholder="PRM-2608-ABC123" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""); }} className={`${inputClass} tabular-nums uppercase`} />
        <FieldError errors={state.errors?.booking_code} locale={locale} />
      </label>
      <label className={labelClass}>
        {localize(locale, "Email atau nomor telepon", "Email or phone number")}
        <input name="contact" required minLength={5} maxLength={255} autoComplete="username" placeholder={localize(locale, "nama@email.com atau 62812…", "name@email.com or 62812…")} className={inputClass} />
        <FieldError errors={state.errors?.contact} locale={locale} />
      </label>
      <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
    <button disabled={pending} className="mt-7 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-sm bg-primary px-6 text-sm font-bold text-background transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60">
      <SearchIcon className="size-4" />
      {pending ? localize(locale, "Mencari pesanan…", "Finding your booking…") : localize(locale, "Lihat status pesanan", "View booking status")}
    </button>
    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted"><ShieldIcon className="mt-0.5 size-4 shrink-0" />{localize(locale, "Kedua data harus cocok agar informasi reservasi tetap pribadi.", "Both details must match to keep your reservation information private.")}</p>
  </form>;
}
