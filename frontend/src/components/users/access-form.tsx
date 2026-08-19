"use client";

import { updateStaffPermissionsAction } from "@/app/internal/(dashboard)/users/actions";
import type { AccessMatrix, ActionState } from "@/lib/api/types";
import { useActionState } from "react";

export function AccessForm({ matrix }: { matrix: AccessMatrix }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateStaffPermissionsAction, {});
  const admin = matrix.roles.find((role) => role.name === "admin");
  const staff = matrix.roles.find((role) => role.name === "staff");
  const selected = new Set(staff?.permissions ?? []);

  return <div className="mt-10 max-w-5xl">
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Administrator</h2><p className="mt-2 text-sm leading-6 text-muted">Role sistem yang dilindungi untuk menjaga akses pengelolaan penuh.</p></div><div className="rounded-lg bg-surface px-5 py-5 shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">Akses penuh</p><span className="rounded-sm bg-secondary-soft px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#5f411b] uppercase">Dilindungi</span></div><p className="mt-2 text-sm leading-6 text-muted">Mencakup seluruh fitur operasional, user, dan pengaturan hak akses.</p><p className="mt-4 text-xs font-medium text-muted">{admin?.permissions.length ?? 0} izin aktif</p></div></section>
    <form action={formAction}>
      <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">Staff</h2><p className="mt-2 text-sm leading-6 text-muted">Pilih pekerjaan yang dapat dilihat dan dilakukan staff. Minimal satu izin melihat wajib aktif.</p></div><div>
        {state.message && <div role={state.success ? "status" : "alert"} className={`mb-6 rounded-sm px-5 py-4 text-sm ${state.success ? "bg-[#edf4ef] text-[#28533b]" : "bg-[#ffdad6] text-[#93000a]"}`}>{state.message}</div>}
        <div className="divide-y overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">{matrix.groups.map((group) => <fieldset key={group.key} className="grid gap-4 px-5 py-5 sm:grid-cols-[150px_1fr]"><legend className="sr-only">{group.label}</legend><p className="font-semibold">{group.label}</p><div className="grid gap-3 sm:grid-cols-2">{group.permissions.map((permission) => <label key={permission.name} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="permissions" value={permission.name} defaultChecked={selected.has(permission.name)} className="size-4 accent-black" /><span>{permission.label}</span></label>)}</div></fieldset>)}</div>
      </div></section>
      <div className="flex justify-end border-t py-8"><button disabled={pending} className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">{pending ? "Menyimpan…" : "Simpan hak akses"}</button></div>
    </form>
  </div>;
}
