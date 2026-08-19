import { deleteUserAction, setUserActivationAction } from "@/app/internal/(dashboard)/users/actions";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { InternalUser } from "@/lib/api/types";
import Link from "next/link";

const dateTime = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

export function UserList({ users }: { users: InternalUser[] }) {
  return <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
    <div className="hidden grid-cols-[1.3fr_0.75fr_0.75fr_1fr_0.85fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid"><span>User</span><span>Role</span><span>Status</span><span>Login terakhir</span><span>Dibuat</span><span>Aksi</span></div>
    <div className="divide-y">{users.map((user) => <article key={user.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.75fr_0.75fr_1fr_0.85fr_auto] lg:items-center lg:px-6">
      <div><p className="font-semibold">{user.name}{user.is_self && <span className="ml-2 text-xs font-medium text-secondary">Akun Anda</span>}</p><p className="mt-1 truncate text-sm text-muted">{user.email}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Role</p><span className="mt-1 inline-flex rounded-sm bg-secondary-soft px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#5f411b] uppercase lg:mt-0">{user.role_labels[0] ?? user.roles[0]}</span></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Status</p><span className={`mt-1 inline-flex rounded-sm px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase lg:mt-0 ${user.is_active ? "bg-[#edf4ef] text-[#28533b]" : "bg-surface-high text-muted"}`}>{user.is_active ? "Aktif" : "Nonaktif"}</span></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Login terakhir</p><p className="mt-1 text-sm font-medium tabular-nums lg:mt-0">{user.last_login_at ? dateTime.format(new Date(user.last_login_at)) : "Belum pernah login"}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Dibuat</p><p className="mt-1 text-sm tabular-nums lg:mt-0">{date.format(new Date(user.created_at))}</p></div>
      <div className="flex flex-wrap items-center gap-x-4 lg:flex-col lg:items-start">
        <Link href={`/internal/users/${user.id}/edit`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">Edit</Link>
        <ConfirmAction action={setUserActivationAction.bind(null, user.id, !user.is_active)} trigger={user.is_active ? "Nonaktifkan" : "Aktifkan"} title={user.is_active ? `Nonaktifkan ${user.name}?` : `Aktifkan ${user.name}?`} description={user.is_active ? "Akses login dihentikan dan seluruh token aktif dicabut. Data operasional tetap tersimpan." : "User kembali dapat login sesuai role dan hak aksesnya."} confirmLabel={user.is_active ? "Ya, nonaktifkan" : "Ya, aktifkan"} tone={user.is_active ? "danger" : "primary"} disabled={!user.can_change_status} />
        <ConfirmAction action={deleteUserAction.bind(null, user.id)} trigger="Hapus" title={`Hapus ${user.name}?`} description="User akan dihapus dari daftar. Aksi ini hanya tersedia untuk akun tanpa riwayat operasional." confirmLabel="Ya, hapus user" disabled={!user.can_delete} />
      </div>
    </article>)}</div>
  </div>;
}
