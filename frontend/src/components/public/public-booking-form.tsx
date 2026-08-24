"use client";

import { createPublicBookingAction } from "@/app/booking/actions";
import { CheckIcon, ShieldIcon } from "@/components/ui/icons";
import type { PublicRoom } from "@/lib/api/types";
import { localize, localizeApiMessage, type Locale } from "@/lib/locale";
import { useActionState } from "react";
import Link from "next/link";

function FieldError({ errors, locale }: { errors?: string[]; locale: Locale }) {
  return errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>);
}

export function PublicBookingForm({ room, checkIn, checkOut, guests, locale }: { room: PublicRoom; checkIn: string; checkOut: string; guests: number; locale: Locale }) {
  const [state, action, pending] = useActionState(createPublicBookingAction, {});
  const inputClass = "mt-2 h-12 w-full border bg-surface px-4 text-sm outline-none transition-colors focus:border-primary";
  const labelClass = "text-xs font-semibold tracking-[0.08em] text-muted uppercase";

  if (state.success && state.booking) return <section className="bg-surface p-7 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.45)] sm:p-9" aria-live="polite">
    <span className="grid size-12 place-items-center rounded-full bg-[#e3f3e8] text-[#28533b]"><CheckIcon className="size-6" /></span>
    <p className="mt-7 text-xs font-semibold tracking-[0.12em] text-secondary uppercase">{localize(locale, "Booking diterima", "Booking received")}</p>
    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{state.booking.booking_code}</h2>
    <p className="mt-4 leading-7 text-muted">{localize(locale, "Permintaanmu berstatus menunggu. Tim Prama Homestay akan menghubungi kamu untuk konfirmasi dan pembayaran.", "Your request is pending. The Prama Homestay team will contact you with confirmation and payment details.")}</p>
    <dl className="mt-7 grid gap-4 bg-surface-low p-5 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted">{localize(locale, "Kamar", "Room")}</dt><dd className="font-semibold">{state.booking.room_name}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">{localize(locale, "Menginap", "Stay")}</dt><dd className="font-semibold">{state.booking.total_nights} {localize(locale, "malam", "nights")}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">Total</dt><dd className="font-semibold">{new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(state.booking.total_amount))}</dd></div></dl>
    <Link href="/" className="mt-7 inline-flex min-h-12 items-center bg-primary px-6 text-sm font-bold text-background">{localize(locale, "Kembali ke beranda", "Return home")}</Link>
  </section>;

  return <form action={action} className="bg-surface p-7 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.45)] sm:p-9">
    <input type="hidden" name="room_id" value={room.id} /><input type="hidden" name="check_in" value={checkIn} /><input type="hidden" name="check_out" value={checkOut} /><input type="hidden" name="guest_count" value={guests} />
    <label className="sr-only">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <p className="text-xs font-semibold tracking-[0.12em] text-secondary uppercase">{localize(locale, "Data pemesan", "Guest details")}</p>
    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{localize(locale, "Lengkapi reservasi", "Complete your reservation")}</h2>
    <p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Belum ada pembayaran pada tahap ini.", "No payment is required at this stage.")}</p>
    {state.message && !state.success && <div role="alert" className="mt-6 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</div>}
    <div className="mt-7 grid gap-5">
      <label className={labelClass}>{localize(locale, "Nama lengkap", "Full name")}<input name="full_name" required maxLength={120} autoComplete="name" className={inputClass} /><FieldError errors={state.errors?.full_name} locale={locale} /></label>
      <label className={labelClass}>Email<input name="email" required type="email" maxLength={255} autoComplete="email" className={inputClass} /><FieldError errors={state.errors?.email} locale={locale} /></label>
      <label className={labelClass}>{localize(locale, "Nomor telepon", "Phone number")}<input name="phone" required maxLength={30} autoComplete="tel" placeholder="+62 812 3456 7890" className={inputClass} /><FieldError errors={state.errors?.phone} locale={locale} /></label>
      <label className={labelClass}>{localize(locale, "Permintaan khusus", "Special requests")} <span className="font-normal normal-case">({localize(locale, "opsional", "optional")})</span><textarea name="special_requests" maxLength={2000} rows={4} className="mt-2 w-full resize-y border bg-surface px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-primary" /><FieldError errors={state.errors?.special_requests} locale={locale} /></label>
    </div>
    <button disabled={pending} className="mt-7 min-h-13 w-full bg-primary px-6 text-sm font-bold text-background disabled:cursor-wait disabled:opacity-60">{pending ? localize(locale, "Mengirim…", "Submitting…") : localize(locale, "Kirim permintaan booking", "Submit booking request")}</button>
    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted"><ShieldIcon className="mt-0.5 size-4 shrink-0" />{localize(locale, "Data digunakan hanya untuk memproses reservasi dan menghubungimu.", "Your details are used only to process the reservation and contact you.")}</p>
  </form>;
}
