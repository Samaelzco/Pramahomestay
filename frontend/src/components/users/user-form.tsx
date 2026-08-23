"use client";

import { createUserAction, updateUserAction } from "@/app/internal/(dashboard)/users/actions";
import type { AccessRole, ActionState, InternalUser } from "@/lib/api/types";
import Link from "next/link";
import { useActionState } from "react";

function FieldError({ errors }: { errors?: string[] }) { return errors?.map((error) => <p key={error} className="mt-2 text-sm font-normal tracking-normal text-danger normal-case">{error}</p>); }

export function UserForm({ user, roles }: { user?: InternalUser; roles: AccessRole[] }) {
  const action = user ? updateUserAction.bind(null, user.id) : createUserAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return <form action={formAction} className="mt-10 max-w-4xl">
    {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{state.message}</div>}
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Identitas user</h2><p className="mt-2 text-sm leading-6 text-muted">Data yang digunakan untuk mengenali anggota tim dan masuk ke area internal.</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Nama lengkap<input name="name" required maxLength={120} defaultValue={user?.name} placeholder="Nama anggota tim" className={inputClass} /><FieldError errors={state.errors?.name} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Email<input name="email" type="email" required maxLength={255} defaultValue={user?.email} placeholder="nama@pramahomestay.com" className={inputClass} /><FieldError errors={state.errors?.email} /></label>
    </div></section>
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Role dan akses</h2><p className="mt-2 text-sm leading-6 text-muted">Administrator memiliki akses penuh. Role lainnya mengikuti permission pada halaman Hak akses.</p></div><div className="grid gap-6 sm:grid-cols-2">
      <div className="grid gap-3">
        <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Role{user?.is_self && <input type="hidden" name="role" value={user.roles[0]} />}<select name={user?.is_self ? undefined : "role"} required disabled={user?.is_self} defaultValue={user?.roles[0] ?? roles.find((role) => !role.is_protected)?.name ?? roles[0]?.name} className={`${inputClass} disabled:cursor-not-allowed disabled:bg-surface-low disabled:text-muted`}>{roles.map((role) => <option key={role.name} value={role.name}>{role.label}</option>)}</select><FieldError errors={state.errors?.role} /></label>
        {!user && <label className="flex min-h-12 items-center gap-3 rounded-sm border bg-surface px-4 text-sm font-medium normal-case tracking-normal transition-colors hover:bg-surface-low"><input type="checkbox" name="is_active" value="1" defaultChecked className="size-4 accent-black" />Aktifkan akses login</label>}
      </div>
    </div></section>
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{user ? "Ganti password" : "Password awal"}</h2><p className="mt-2 text-sm leading-6 text-muted">{user ? "Kosongkan kedua kolom jika password tidak perlu diubah." : "Minimal 8 karakter serta mengandung huruf dan angka."}</p></div><div className="grid gap-6 sm:grid-cols-2">
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Password<input name="password" type="password" required={!user} minLength={8} autoComplete="new-password" className={inputClass} /><FieldError errors={state.errors?.password} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Ulangi password<input name="password_confirmation" type="password" required={!user} minLength={8} autoComplete="new-password" className={inputClass} /></label>
    </div></section>
    {user?.is_self && <p className="border-t py-5 text-sm leading-6 text-muted">Anda dapat mengubah identitas dan password akun ini, tetapi tidak dapat mengganti role atau menonaktifkan akun sendiri.</p>}
    <div className="flex flex-col-reverse gap-3 border-t py-8 sm:flex-row sm:justify-end"><Link href="/internal/users" className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-low">Batal</Link><button disabled={pending} className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">{pending ? "Menyimpan…" : user ? "Simpan perubahan" : "Tambahkan user"}</button></div>
  </form>;
}
