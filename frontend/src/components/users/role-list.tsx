"use client";

import { deleteRoleAction } from "@/app/internal/(dashboard)/users/actions";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { AccessRole } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";
import Link from "next/link";

export function RoleList({ roles }: { roles: AccessRole[] }) {
  const locale = useLocale();
  return <div className="mt-8 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
    <div className="hidden grid-cols-[1.1fr_1.5fr_0.65fr_0.65fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid"><span>Role</span><span>{localize(locale, "Ruang kerja", "Workspace")}</span><span>{localize(locale, "Permission", "Permissions")}</span><span>User</span><span>{localize(locale, "Aksi", "Actions")}</span></div>
    <div className="divide-y">{roles.map((role) => <article key={role.name} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.5fr_0.65fr_0.65fr_auto] lg:items-center lg:px-6">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{role.label}</p>{role.is_protected && <span className="rounded-sm bg-secondary-soft px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#5f411b] uppercase">{localize(locale, "Dilindungi", "Protected")}</span>}</div><p className="mt-1 truncate text-xs text-muted">{role.name}</p></div>
      <div className="min-w-0"><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Ruang kerja</p><p className="mt-1 line-clamp-2 text-sm leading-6 text-muted lg:mt-0">{role.description || "Belum ada deskripsi tanggung jawab."}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Permission", "Permissions")}</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{role.permissions.length} {localize(locale, "izin", "permissions")}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">User</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{role.user_count} user</p></div>
      <div className="flex flex-wrap items-center gap-x-4 lg:flex-col lg:items-start">
        {role.is_protected ? <button type="button" disabled className="inline-flex min-h-10 cursor-not-allowed items-center text-sm font-semibold text-muted">Edit</button> : <Link href={`/internal/users/access/${role.name}/edit`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">Edit</Link>}
        <ConfirmAction action={deleteRoleAction.bind(null, role.name)} trigger={localize(locale, "Hapus", "Delete")} title={localize(locale, `Hapus role ${role.label}?`, `Delete role ${role.label}?`)} description={localize(locale, "Role akan dihapus permanen dari konfigurasi akses. Aksi ini hanya tersedia jika belum digunakan user.", "The role will be permanently removed from access configuration. This is only available when no user uses it.")} confirmLabel={localize(locale, "Ya, hapus role", "Yes, delete role")} disabled={!role.can_delete} />
      </div>
    </article>)}</div>
  </div>;
}
