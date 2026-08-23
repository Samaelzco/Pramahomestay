"use client";

import { updateSettingsAction } from "@/app/internal/(dashboard)/settings/actions";
import { SettingsLogoInput } from "@/components/settings/settings-logo-input";
import type { ActionState, HomestaySettings } from "@/lib/api/types";
import { useActionState } from "react";

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.map((error) => <p key={error} className="mt-2 text-sm font-normal tracking-normal text-danger normal-case">{error}</p>);
}

export function SettingsForm({ settings }: { settings: HomestaySettings }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateSettingsAction, {});
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";
  const labelClass = "text-xs font-semibold tracking-[0.08em] text-muted uppercase";
  const textareaClass = "mt-2 min-h-32 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-sm leading-6 font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return <form action={formAction} className="mt-10 max-w-5xl">
    {state.message && <div role={state.success ? "status" : "alert"} className={`mb-8 rounded-sm px-5 py-4 text-sm ${state.success ? "bg-[#edf4ef] text-[#28533b]" : "bg-[#ffdad6] text-[#93000a]"}`}>{state.message}</div>}

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Identitas homestay</h2><p className="mt-2 text-sm leading-6 text-muted">Informasi utama yang mewakili properti dan membantu tamu menghubungi tim.</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className={labelClass}>Nama homestay<input name="name" required maxLength={120} defaultValue={settings.name} placeholder="Nama homestay" className={inputClass} /><FieldError errors={state.errors?.name} /></label>
      <label className={labelClass}>Email<input name="email" type="email" maxLength={255} defaultValue={settings.email ?? ""} placeholder="reservasi@pramahomestay.com" className={inputClass} /><FieldError errors={state.errors?.email} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Alamat<textarea name="address" required maxLength={2000} defaultValue={settings.address} className={textareaClass} /><FieldError errors={state.errors?.address} /></label>
      <label className={labelClass}>Telepon<input name="phone" maxLength={30} defaultValue={settings.phone ?? ""} placeholder="Contoh: +62 812 3456 7890" className={inputClass} /><FieldError errors={state.errors?.phone} /></label>
      <label className={labelClass}>Tautan Google Maps<input name="maps_url" type="url" required maxLength={2048} defaultValue={settings.maps_url} className={inputClass} /><FieldError errors={state.errors?.maps_url} /></label>
      <SettingsLogoInput currentLogoUrl={settings.logo_url} errors={state.errors?.logo} />
    </div></section>

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Operasional</h2><p className="mt-2 text-sm leading-6 text-muted">Atur waktu layanan properti. Jam check-in dan check-out boleh dikosongkan sampai kebijakan ditetapkan.</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className={labelClass}>Jam check-in<input name="check_in_time" type="time" defaultValue={settings.check_in_time ?? ""} className={`${inputClass} tabular-nums`} /><FieldError errors={state.errors?.check_in_time} /></label>
      <label className={labelClass}>Jam check-out<input name="check_out_time" type="time" defaultValue={settings.check_out_time ?? ""} className={`${inputClass} tabular-nums`} /><FieldError errors={state.errors?.check_out_time} /></label>
      <label className={labelClass}>Zona waktu<select name="timezone" required defaultValue={settings.timezone} className={inputClass}><option value="Asia/Jakarta">WIB · UTC+7</option><option value="Asia/Makassar">WITA · UTC+8</option><option value="Asia/Jayapura">WIT · UTC+9</option></select><FieldError errors={state.errors?.timezone} /></label>
      <label className={labelClass}>Mata uang<input name="currency" value="IDR" readOnly className={`${inputClass} cursor-not-allowed bg-surface-low text-muted`} /><p className="mt-2 text-xs font-normal tracking-normal text-muted normal-case">Sistem transaksi saat ini menggunakan Rupiah.</p><FieldError errors={state.errors?.currency} /></label>
    </div></section>

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Pembayaran</h2><p className="mt-2 text-sm leading-6 text-muted">Simpan tujuan pembayaran yang nantinya dapat digunakan pada konfirmasi booking.</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className={labelClass}>Nama bank<input name="bank_name" maxLength={100} defaultValue={settings.bank_name ?? ""} placeholder="Contoh: Bank BCA" className={inputClass} /><FieldError errors={state.errors?.bank_name} /></label>
      <label className={labelClass}>Nomor rekening<input name="bank_account_number" maxLength={80} defaultValue={settings.bank_account_number ?? ""} placeholder="Masukkan nomor rekening" className={`${inputClass} tabular-nums`} /><FieldError errors={state.errors?.bank_account_number} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Nama pemilik rekening<input name="bank_account_holder" maxLength={120} defaultValue={settings.bank_account_holder ?? ""} placeholder="Nama sesuai rekening" className={inputClass} /><FieldError errors={state.errors?.bank_account_holder} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Informasi QRIS<textarea name="qris_notes" maxLength={1000} defaultValue={settings.qris_notes ?? ""} placeholder="Tambahkan nama merchant atau petunjuk QRIS jika sudah tersedia." className={textareaClass} /><FieldError errors={state.errors?.qris_notes} /></label>
    </div></section>

    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Reservasi</h2><p className="mt-2 text-sm leading-6 text-muted">Tentukan identitas kode dan informasi yang akan menjadi acuan tim saat menangani reservasi.</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className={labelClass}>Prefix kode booking<input name="booking_code_prefix" required minLength={2} maxLength={10} defaultValue={settings.booking_code_prefix} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase(); }} className={`${inputClass} uppercase`} /><FieldError errors={state.errors?.booking_code_prefix} /></label>
      <label className={labelClass}>Prefix kode pembayaran<input name="payment_code_prefix" required minLength={2} maxLength={10} defaultValue={settings.payment_code_prefix} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase(); }} className={`${inputClass} uppercase`} /><FieldError errors={state.errors?.payment_code_prefix} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Kebijakan pembatalan<textarea name="cancellation_policy" maxLength={5000} defaultValue={settings.cancellation_policy ?? ""} placeholder="Tuliskan batas waktu, biaya, dan ketentuan pembatalan ketika kebijakan sudah tersedia." className={textareaClass} /><FieldError errors={state.errors?.cancellation_policy} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Instruksi pembayaran<textarea name="payment_instructions" maxLength={5000} defaultValue={settings.payment_instructions ?? ""} placeholder="Tuliskan tenggat pembayaran dan cara mengirim bukti transaksi ketika sudah tersedia." className={textareaClass} /><FieldError errors={state.errors?.payment_instructions} /></label>
    </div></section>

    <div className="flex justify-end border-t py-8"><button disabled={pending} className="h-12 w-full rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:cursor-wait disabled:opacity-60 sm:w-auto">{pending ? "Menyimpan…" : "Simpan pengaturan"}</button></div>
  </form>;
}
