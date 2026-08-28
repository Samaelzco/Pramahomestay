"use client";

import { createPublicBookingAction } from "@/app/booking/actions";
import { ShieldIcon } from "@/components/ui/icons";
import type { PublicRoom } from "@/lib/api/types";
import { localize, localizeApiMessage, type Locale } from "@/lib/locale";
import { useActionState } from "react";

function FieldError({ errors, locale }: { errors?: string[]; locale: Locale }) {
  return errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>);
}

export function PublicBookingForm({ room, checkIn, checkOut, guests, locale }: { room: PublicRoom; checkIn: string; checkOut: string; guests: number; locale: Locale }) {
  const [state, action, pending] = useActionState(createPublicBookingAction, {});
  const inputClass = "mt-2 h-12 w-full border bg-surface px-4 text-sm outline-none transition-colors focus:border-primary";
  const labelClass = "text-xs font-semibold tracking-[0.08em] text-muted uppercase";

  return <form action={action} className="bg-surface p-7 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.45)] sm:p-9">
    <input type="hidden" name="room_id" value={room.id} /><input type="hidden" name="check_in" value={checkIn} /><input type="hidden" name="check_out" value={checkOut} /><input type="hidden" name="guest_count" value={guests} />
    <p className="text-xs font-semibold tracking-[0.12em] text-secondary uppercase">{localize(locale, "Data pemesan", "Guest details")}</p>
    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{localize(locale, "Lengkapi reservasi", "Complete your reservation")}</h2>
    <p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Setelah data dikirim, kamu akan melanjutkan ke pembayaran.", "After submitting your details, you will continue to payment.")}</p>
    {state.message && !state.success && <div role="alert" className="mt-6 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</div>}
    <div className="mt-7 grid gap-5">
      <label className={labelClass}>{localize(locale, "Nama lengkap", "Full name")}<input name="full_name" required maxLength={120} autoComplete="name" className={inputClass} /><FieldError errors={state.errors?.full_name} locale={locale} /></label>
      <label className={labelClass}>Email<input name="email" required type="email" maxLength={255} autoComplete="email" className={inputClass} /><FieldError errors={state.errors?.email} locale={locale} /></label>
      <label className={labelClass}>{localize(locale, "Nomor telepon", "Phone number")}<input name="phone" required type="tel" inputMode="numeric" pattern="[0-9]{8,20}" minLength={8} maxLength={20} autoComplete="tel" placeholder="6281234567890" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, ""); }} className={inputClass} /><p className="mt-2 text-xs font-normal tracking-normal text-muted normal-case">{localize(locale, "Gunakan angka saja, termasuk kode negara.", "Use numbers only, including the country code.")}</p><FieldError errors={state.errors?.phone} locale={locale} /></label>
    </div>
    <button disabled={pending} className="mt-7 min-h-13 w-full bg-primary px-6 text-sm font-bold text-background disabled:cursor-wait disabled:opacity-60">{pending ? localize(locale, "Menyiapkan pembayaran…", "Preparing payment…") : localize(locale, "Lanjut ke pembayaran", "Continue to payment")}</button>
    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted"><ShieldIcon className="mt-0.5 size-4 shrink-0" />{localize(locale, "Data digunakan hanya untuk memproses reservasi dan menghubungimu.", "Your details are used only to process the reservation and contact you.")}</p>
  </form>;
}
