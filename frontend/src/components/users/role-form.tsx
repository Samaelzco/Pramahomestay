"use client";

import { createRoleAction, updateRoleAction } from "@/app/internal/(dashboard)/users/actions";
import type { AccessMatrix, AccessRole, ActionState } from "@/lib/api/types";
import { moduleLabel, permissionLabel } from "@/lib/display-labels";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import Link from "next/link";
import { useActionState } from "react";

function FieldError({ errors }: { errors?: string[] }) { const locale = useLocale(); return errors?.map((error) => <p key={error} className="mt-2 text-sm font-normal tracking-normal text-danger normal-case">{localizeApiMessage(locale, error)}</p>); }

export function RoleForm({ matrix, role }: { matrix: AccessMatrix; role?: AccessRole }) {
  const locale = useLocale();
  const action = role ? updateRoleAction.bind(null, role.name) : createRoleAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const selected = new Set(role?.permissions ?? []);
  const inputClass = "mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-base font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary";

  return <form action={formAction} className="mt-10 max-w-5xl">
    {state.message && <div role="alert" className="mb-8 rounded-sm bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</div>}
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Identitas role", "Role identity")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Nama terlihat pada user dan deskripsi membantu admin memahami tanggung jawabnya.", "The name appears on users, while the description helps admins understand its responsibilities.")}</p></div><div className="grid gap-6">
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Nama role", "Role name")}<input name="display_name" required maxLength={100} defaultValue={role?.label} placeholder={localize(locale, "Contoh: Resepsionis", "Example: Receptionist")} className={inputClass} /><FieldError errors={state.errors?.display_name} /></label>
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Deskripsi", "Description")}<textarea name="description" maxLength={500} rows={3} defaultValue={role?.description ?? ""} placeholder={localize(locale, "Jelaskan tanggung jawab utama role ini", "Describe the role's primary responsibilities")} className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-base font-normal leading-6 tracking-normal normal-case outline-none focus:border-primary" /><FieldError errors={state.errors?.description} /></label>
      {role && <p className="text-xs leading-5 text-muted">{localize(locale, "Slug internal", "Internal slug")} <span className="font-semibold text-primary">{role.name}</span> {localize(locale, "tetap dipertahankan agar assignment user dan aturan akses stabil.", "is preserved to keep user assignments and access rules stable.")}</p>}
    </div></section>
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]"><div><h2 className="text-lg font-semibold">{localize(locale, "Permission", "Permissions")}</h2><p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Pilih pekerjaan yang dapat dilihat dan dilakukan. Minimal satu izin melihat wajib aktif.", "Choose what this role can view and do. At least one view permission must be enabled.")}</p></div><div>
      <FieldError errors={state.errors?.permissions} />
      <div className="divide-y overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">{matrix.groups.map((group) => <fieldset key={group.key} className="grid gap-4 px-5 py-5 sm:grid-cols-[150px_1fr]"><legend className="sr-only">{moduleLabel(group.key, group.label, locale)}</legend><p className="font-semibold">{moduleLabel(group.key, group.label, locale)}</p><div className="grid gap-3 sm:grid-cols-2">{group.permissions.map((permission) => <label key={permission.name} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="permissions" value={permission.name} defaultChecked={selected.has(permission.name)} className="size-4 accent-secondary" /><span>{permissionLabel(permission.name, permission.label, locale)}</span></label>)}</div></fieldset>)}</div>
    </div></section>
    <div className="flex flex-col-reverse gap-3 border-t py-8 sm:flex-row sm:justify-end"><Link href="/internal/users/access" className="flex h-12 items-center justify-center rounded-sm border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-low">{localize(locale, "Batal", "Cancel")}</Link><button disabled={pending} className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">{pending ? localize(locale, "Menyimpan…", "Saving…") : role ? localize(locale, "Simpan perubahan", "Save changes") : localize(locale, "Tambahkan role", "Add role")}</button></div>
  </form>;
}
