"use client";

import { updateSettingsAction } from "@/app/internal/(dashboard)/settings/actions";
import { SettingsLogoInput } from "@/components/settings/settings-logo-input";
import { SettingsHeroMediaInput } from "@/components/settings/settings-hero-media-input";
import { SettingsFinalCtaImageInput } from "@/components/settings/settings-final-cta-image-input";
import type { ActionState, HomestaySettings } from "@/lib/api/types";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import { useActionState } from "react";

function FieldError({ errors }: { errors?: string[] }) {
  const locale = useLocale();
  return errors?.map((error) => <p key={error} className="mt-2 text-sm font-normal tracking-normal text-danger normal-case">{localizeApiMessage(locale, error)}</p>);
}

export function SettingsForm({ settings }: { settings: HomestaySettings }) {
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateSettingsAction, {});
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";
  const labelClass = "text-xs font-semibold tracking-[0.08em] text-muted uppercase";
  const textareaClass = "mt-2 min-h-32 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm leading-6 font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return <form action={formAction} className="mt-10 max-w-5xl">
    {state.message && <div role={state.success ? "status" : "alert"} className={`mb-8 rounded-sm px-5 py-4 text-sm ${state.success ? "bg-[#edf4ef] text-[#28533b]" : "bg-[#ffdad6] text-[#93000a]"}`}>{localizeApiMessage(locale, state.message)}</div>}

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Identitas homestay", "Homestay identity")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Informasi utama yang mewakili properti dan membantu tamu menghubungi tim.", "Core property information that helps guests contact the team.")}</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className={labelClass}>{localize(locale, "Nama homestay", "Homestay name")}<input name="name" required maxLength={120} defaultValue={settings.name} placeholder={localize(locale, "Nama homestay", "Homestay name")} className={inputClass} /><FieldError errors={state.errors?.name} /></label>
      <label className={labelClass}>Email<input name="email" type="email" maxLength={255} defaultValue={settings.email ?? ""} placeholder="reservasi@pramahomestay.com" className={inputClass} /><FieldError errors={state.errors?.email} /></label>
      <label className={`${labelClass} sm:col-span-2`}>{localize(locale, "Alamat", "Address")}<textarea name="address" required maxLength={2000} defaultValue={settings.address} className={textareaClass} /><FieldError errors={state.errors?.address} /></label>
      <label className={labelClass}>{localize(locale, "Telepon", "Phone")}<input name="phone" maxLength={30} defaultValue={settings.phone ?? ""} placeholder={localize(locale, "Contoh: +62 812 3456 7890", "Example: +62 812 3456 7890")} className={inputClass} /><FieldError errors={state.errors?.phone} /></label>
      <label className={labelClass}>{localize(locale, "Tautan Google Maps", "Google Maps link")}<input name="maps_url" type="url" required maxLength={2048} defaultValue={settings.maps_url} className={inputClass} /><FieldError errors={state.errors?.maps_url} /></label>
      <SettingsLogoInput currentLogoUrl={settings.logo_url} errors={state.errors?.logo} />
    </div></section>

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Media hero", "Hero media")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Pilih carousel gambar atau video pendek yang tampil sebagai latar utama landing page.", "Choose an image carousel or short video for the landing page hero background.")}</p></div><SettingsHeroMediaInput settings={settings} errors={state.errors} /></section>

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "CTA penutup", "Final CTA")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Atur gambar latar ajakan reservasi yang muncul sebelum footer.", "Set the background image for the reservation call-to-action before the footer.")}</p></div><SettingsFinalCtaImageInput currentImageUrl={settings.final_cta_image_url} errors={state.errors?.final_cta_image} /></section>

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Operasional", "Operations")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Atur waktu layanan properti. Jam check-in dan check-out boleh dikosongkan sampai kebijakan ditetapkan.", "Configure property service times. Check-in and check-out times may remain empty until a policy is set.")}</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className={labelClass}>{localize(locale, "Jam check-in", "Check-in time")}<input name="check_in_time" type="time" defaultValue={settings.check_in_time ?? ""} className={`${inputClass} tabular-nums`} /><FieldError errors={state.errors?.check_in_time} /></label>
      <label className={labelClass}>{localize(locale, "Jam check-out", "Check-out time")}<input name="check_out_time" type="time" defaultValue={settings.check_out_time ?? ""} className={`${inputClass} tabular-nums`} /><FieldError errors={state.errors?.check_out_time} /></label>
      <label className={labelClass}>{localize(locale, "Zona waktu", "Time zone")}<select name="timezone" required defaultValue={settings.timezone} className={inputClass}><option value="Asia/Jakarta">WIB · UTC+7</option><option value="Asia/Makassar">WITA · UTC+8</option><option value="Asia/Jayapura">WIT · UTC+9</option></select><FieldError errors={state.errors?.timezone} /></label>
      <label className={labelClass}>{localize(locale, "Mata uang", "Currency")}<input name="currency" value="IDR" readOnly className={`${inputClass} cursor-not-allowed bg-surface-low text-muted`} /><p className="mt-2 text-xs font-normal tracking-normal text-muted normal-case">{localize(locale, "Sistem transaksi saat ini menggunakan Rupiah.", "Transactions currently use Indonesian Rupiah.")}</p><FieldError errors={state.errors?.currency} /></label>
    </div></section>

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Pembayaran", "Payments")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Simpan tujuan pembayaran yang nantinya dapat digunakan pada konfirmasi booking.", "Save payment destination details for future booking confirmations.")}</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className={labelClass}>{localize(locale, "Nama bank", "Bank name")}<input name="bank_name" maxLength={100} defaultValue={settings.bank_name ?? ""} placeholder={localize(locale, "Contoh: Bank BCA", "Example: Bank BCA")} className={inputClass} /><FieldError errors={state.errors?.bank_name} /></label>
      <label className={labelClass}>{localize(locale, "Nomor rekening", "Account number")}<input name="bank_account_number" maxLength={80} defaultValue={settings.bank_account_number ?? ""} placeholder={localize(locale, "Masukkan nomor rekening", "Enter the account number")} className={`${inputClass} tabular-nums`} /><FieldError errors={state.errors?.bank_account_number} /></label>
      <label className={`${labelClass} sm:col-span-2`}>{localize(locale, "Nama pemilik rekening", "Account holder name")}<input name="bank_account_holder" maxLength={120} defaultValue={settings.bank_account_holder ?? ""} placeholder={localize(locale, "Nama sesuai rekening", "Name shown on the account")} className={inputClass} /><FieldError errors={state.errors?.bank_account_holder} /></label>
      <label className={`${labelClass} sm:col-span-2`}>{localize(locale, "Informasi QRIS", "QRIS information")}<textarea name="qris_notes" maxLength={1000} defaultValue={settings.qris_notes ?? ""} placeholder={localize(locale, "Tambahkan nama merchant atau petunjuk QRIS jika sudah tersedia.", "Add the merchant name or QRIS instructions when available.")} className={textareaClass} /><FieldError errors={state.errors?.qris_notes} /></label>
    </div></section>

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Reservasi", "Reservations")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Tentukan identitas kode dan informasi yang akan menjadi acuan tim saat menangani reservasi.", "Define code identifiers and information the team uses when handling reservations.")}</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className={labelClass}>{localize(locale, "Prefix kode booking", "Booking code prefix")}<input name="booking_code_prefix" required minLength={2} maxLength={10} defaultValue={settings.booking_code_prefix} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase(); }} className={`${inputClass} uppercase`} /><FieldError errors={state.errors?.booking_code_prefix} /></label>
      <label className={labelClass}>{localize(locale, "Prefix kode pembayaran", "Payment code prefix")}<input name="payment_code_prefix" required minLength={2} maxLength={10} defaultValue={settings.payment_code_prefix} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase(); }} className={`${inputClass} uppercase`} /><FieldError errors={state.errors?.payment_code_prefix} /></label>
      <label className={`${labelClass} sm:col-span-2`}>{localize(locale, "Kebijakan pembatalan", "Cancellation policy")}<textarea name="cancellation_policy" maxLength={5000} defaultValue={settings.cancellation_policy ?? ""} placeholder={localize(locale, "Tuliskan batas waktu, biaya, dan ketentuan pembatalan ketika kebijakan sudah tersedia.", "Add cancellation deadlines, fees, and terms when the policy is available.")} className={textareaClass} /><FieldError errors={state.errors?.cancellation_policy} /></label>
      <label className={`${labelClass} sm:col-span-2`}>{localize(locale, "Instruksi pembayaran", "Payment instructions")}<textarea name="payment_instructions" maxLength={5000} defaultValue={settings.payment_instructions ?? ""} placeholder={localize(locale, "Tuliskan tenggat pembayaran dan cara mengirim bukti transaksi ketika sudah tersedia.", "Add the payment deadline and instructions for submitting transaction receipts when available.")} className={textareaClass} /><FieldError errors={state.errors?.payment_instructions} /></label>
    </div></section>

    <div className="flex justify-end border-t py-8"><button disabled={pending} className="h-12 w-full rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:cursor-wait disabled:opacity-60 sm:w-auto">{pending ? localize(locale, "Menyimpan…", "Saving…") : localize(locale, "Simpan pengaturan", "Save settings")}</button></div>
  </form>;
}
