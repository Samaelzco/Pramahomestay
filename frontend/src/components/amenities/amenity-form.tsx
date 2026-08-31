"use client";

import { createAmenityAction, updateAmenityAction } from "@/app/internal/(dashboard)/amenities/actions";
import type { ActionState, Amenity } from "@/lib/api/types";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import Link from "next/link";
import { useActionState } from "react";

function FieldError({ errors }: { errors?: string[] }) {
  const locale = useLocale();
  return errors?.map((error) => <p key={error} className="mt-2 text-sm font-normal tracking-normal text-danger normal-case">{localizeApiMessage(locale, error)}</p>);
}

export function AmenityForm({ amenity }: { amenity?: Amenity }) {
  const locale = useLocale();
  const action = amenity ? updateAmenityAction.bind(null, amenity.id) : createAmenityAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const inputClass = "mt-2 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return <form action={formAction} className="mt-10 max-w-4xl">
    {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</div>}
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]">
      <div><h2 className="text-lg font-semibold">{localize(locale, "Detail fasilitas", "Amenity details")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Isi kedua bahasa agar pelanggan melihat nama dan deskripsi yang tepat.", "Complete both languages so guests see the correct name and description.")}</p></div>
      <div className="grid gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Nama · Indonesia", "Name · Indonesian")}<input name="name" required maxLength={100} defaultValue={amenity?.name} placeholder="Contoh: Air panas" lang="id" className={`${inputClass} h-12`} /><FieldError errors={state.errors?.name} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Nama · Inggris", "Name · English")} <span className="font-normal normal-case">({localize(locale, "opsional", "optional")})</span><input name="name_en" maxLength={100} defaultValue={amenity?.name_en ?? ""} placeholder="Example: Hot water" lang="en" className={`${inputClass} h-12`} /><FieldError errors={state.errors?.name_en} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Deskripsi · Indonesia", "Description · Indonesian")} <span className="font-normal normal-case">({localize(locale, "opsional", "optional")})</span><textarea name="description" maxLength={500} rows={4} defaultValue={amenity?.description ?? ""} placeholder="Keterangan singkat fasilitas" lang="id" className={`${inputClass} resize-y py-3 leading-6`} /><FieldError errors={state.errors?.description} /></label>
          <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Deskripsi · Inggris", "Description · English")} <span className="font-normal normal-case">({localize(locale, "opsional", "optional")})</span><textarea name="description_en" maxLength={500} rows={4} defaultValue={amenity?.description_en ?? ""} placeholder="A short amenity description" lang="en" className={`${inputClass} resize-y py-3 leading-6`} /><FieldError errors={state.errors?.description_en} /></label>
        </div>
        <label className="flex min-h-12 items-center gap-3 rounded-sm border bg-surface px-4 text-sm font-medium normal-case tracking-normal transition-colors hover:bg-surface-low"><input type="checkbox" name="is_active" value="1" defaultChecked={amenity?.is_active ?? true} className="size-4 accent-secondary" />{localize(locale, "Tampilkan sebagai pilihan aktif", "Show as an active option")}</label>
      </div>
    </section>
    <div className="flex flex-col-reverse gap-3 border-t py-8 sm:flex-row sm:justify-end"><Link href="/internal/amenities" className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-low">{localize(locale, "Batal", "Cancel")}</Link><button disabled={pending} className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">{pending ? localize(locale, "Menyimpan…", "Saving…") : amenity ? localize(locale, "Simpan perubahan", "Save changes") : localize(locale, "Tambah fasilitas", "Add amenity")}</button></div>
  </form>;
}
