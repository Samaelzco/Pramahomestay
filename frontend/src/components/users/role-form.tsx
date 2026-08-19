"use client";

import { createRoleAction, updateRoleAction } from "@/app/internal/(dashboard)/users/actions";
import type { AccessMatrix, AccessRole, ActionState } from "@/lib/api/types";
import Link from "next/link";
import { useActionState } from "react";

function FieldError({ errors }: { errors?: string[] }) { return errors?.map((error) => <p key={error} className="mt-2 text-sm font-normal tracking-normal text-danger normal-case">{error}</p>); }

export function RoleForm({ matrix, role }: { matrix: AccessMatrix; role?: AccessRole }) {
  const action = role ? updateRoleAction.bind(null, role.name) : createRoleAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const selected = new Set(role?.permissions ?? []);
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-base font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return <form action={formAction} className="mt-10 max-w-5xl">
    {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{state.message}</div>}
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Identitas role</h2><p className="mt-2 text-sm leading-6 text-muted">Nama terlihat pada user dan deskripsi membantu admin memahami tanggung jawabnya.</p></div><div className="grid gap-6">
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Nama role<input name="display_name" required maxLength={100} defaultValue={role?.label} placeholder="Contoh: Resepsionis" className={inputClass} /><FieldError errors={state.errors?.display_name} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Deskripsi<textarea name="description" maxLength={500} rows={3} defaultValue={role?.description ?? ""} placeholder="Jelaskan tanggung jawab utama role ini" className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-base font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary" /><FieldError errors={state.errors?.description} /></label>
      {role && <p className="text-xs leading-5 text-muted">Slug internal <span className="font-semibold text-primary">{role.name}</span> tetap dipertahankan agar assignment user dan aturan akses stabil.</p>}
    </div></section>
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Permission</h2><p className="mt-2 text-sm leading-6 text-muted">Pilih pekerjaan yang dapat dilihat dan dilakukan. Minimal satu izin melihat wajib aktif.</p></div><div>
      <FieldError errors={state.errors?.permissions} />
      <div className="divide-y overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">{matrix.groups.map((group) => <fieldset key={group.key} className="grid gap-4 px-5 py-5 sm:grid-cols-[150px_1fr]"><legend className="sr-only">{group.label}</legend><p className="font-semibold">{group.label}</p><div className="grid gap-3 sm:grid-cols-2">{group.permissions.map((permission) => <label key={permission.name} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="permissions" value={permission.name} defaultChecked={selected.has(permission.name)} className="size-4 accent-black" /><span>{permission.label}</span></label>)}</div></fieldset>)}</div>
    </div></section>
    <div className="flex flex-col-reverse gap-3 border-t py-8 sm:flex-row sm:justify-end"><Link href="/internal/users/access" className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-low">Batal</Link><button disabled={pending} className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">{pending ? "Menyimpan…" : role ? "Simpan perubahan" : "Tambahkan role"}</button></div>
  </form>;
}
