import type { AuditAction, AuditLog } from "@/lib/api/types";
import Link from "next/link";

const dateTime = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const actionTone: Record<AuditAction, string> = {
  created: "bg-[#edf4ef] text-[#28533b]",
  updated: "bg-secondary-soft text-[#5f411b]",
  deleted: "bg-[#ffdad6] text-[#93000a]",
  activated: "bg-[#edf4ef] text-[#28533b]",
  deactivated: "bg-surface-high text-muted",
  cancelled: "bg-[#ffdad6] text-[#93000a]",
  refunded: "bg-[#f2e8dc] text-[#694b27]",
};

export function AuditLogList({ logs }: { logs: AuditLog[] }) {
  return <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
    <div className="hidden grid-cols-[1.3fr_0.7fr_1fr_0.9fr_0.9fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid"><span>Aktivitas</span><span>Modul</span><span>Target</span><span>User</span><span>Waktu</span><span>Aksi</span></div>
    <div className="divide-y">{logs.map((log) => <article key={log.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr_0.9fr_0.9fr_auto] lg:items-center lg:px-6">
      <div><span className={`inline-flex rounded-sm px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${actionTone[log.action]}`}>{log.action_label}</span><p className="mt-2 text-sm leading-6 text-muted">{log.description}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Modul</p><p className="mt-1 text-sm font-medium lg:mt-0">{log.module_label}</p></div>
      <div className="min-w-0"><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Target</p><p className="mt-1 truncate text-sm font-semibold lg:mt-0">{log.subject_label ?? `#${log.subject_id}`}</p></div>
      <div className="min-w-0"><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">User</p><p className="mt-1 truncate text-sm font-medium lg:mt-0">{log.actor?.name ?? "User terhapus"}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Waktu</p><p className="mt-1 text-sm leading-6 tabular-nums lg:mt-0">{dateTime.format(new Date(log.created_at))}</p></div>
      <Link href={`/internal/audit-logs/${log.id}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">Lihat detail</Link>
    </article>)}</div>
  </div>;
}
