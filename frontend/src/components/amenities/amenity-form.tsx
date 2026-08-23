"use client";

import { createAmenityAction, updateAmenityAction } from "@/app/internal/(dashboard)/amenities/actions";
import type { ActionState, Amenity } from "@/lib/api/types";
import Link from "next/link";
import { useActionState } from "react";

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.map((error) => <p key={error} className="mt-2 text-sm font-normal tracking-normal text-danger normal-case">{error}</p>);
}

export function AmenityForm({ amenity }: { amenity?: Amenity }) {
  const action = amenity ? updateAmenityAction.bind(null, amenity.id) : createAmenityAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const inputClass = "mt-2 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return <form action={formAction} className="mt-10 max-w-4xl">
    {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{state.message}</div>}
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]">
      <div><h2 className="text-lg font-semibold">Detail fasilitas</h2><p className="mt-2 text-sm leading-6 text-muted">Nama ini akan muncul sebagai pilihan checkbox ketika kamar ditambah atau diedit.</p></div>
      <div className="grid gap-6">
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Nama fasilitas<input name="name" required maxLength={100} defaultValue={amenity?.name} placeholder="Contoh: Wi-Fi" className={`${inputClass} h-12`} /><FieldError errors={state.errors?.name} /></label>
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Deskripsi <span className="font-normal normal-case">(opsional)</span><textarea name="description" maxLength={500} rows={4} defaultValue={amenity?.description ?? ""} placeholder="Keterangan singkat untuk tim internal" className={`${inputClass} resize-y py-3 leading-6`} /><FieldError errors={state.errors?.description} /></label>
        <label className="flex min-h-12 items-center gap-3 rounded-sm border bg-surface px-4 text-sm font-medium normal-case tracking-normal transition-colors hover:bg-surface-low"><input type="checkbox" name="is_active" value="1" defaultChecked={amenity?.is_active ?? true} className="size-4 accent-black" />Tampilkan sebagai pilihan aktif</label>
      </div>
    </section>
    <div className="flex flex-col-reverse gap-3 border-t py-8 sm:flex-row sm:justify-end"><Link href="/internal/amenities" className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-low">Batal</Link><button disabled={pending} className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">{pending ? "Menyimpan…" : amenity ? "Simpan perubahan" : "Tambah fasilitas"}</button></div>
  </form>;
}
