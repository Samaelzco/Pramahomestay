import { SearchIcon } from "@/components/ui/icons";
import type { AuditAction, AuditModule } from "@/lib/api/types";

const modules: Array<{ value: AuditModule; label: string }> = [
  { value: "rooms", label: "Kamar" },
  { value: "bookings", label: "Booking" },
  { value: "payments", label: "Pembayaran" },
  { value: "guests", label: "Tamu" },
  { value: "users", label: "User" },
  { value: "roles", label: "Hak akses" },
];
const actions: Array<{ value: AuditAction; label: string }> = [
  { value: "created", label: "Ditambahkan" },
  { value: "updated", label: "Diperbarui" },
  { value: "activated", label: "Diaktifkan" },
  { value: "deactivated", label: "Dinonaktifkan" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "refunded", label: "Dikembalikan" },
  { value: "deleted", label: "Dihapus" },
];

type Props = {
  search?: string;
  module?: string;
  action?: string;
  actorId?: string;
  dateFrom?: string;
  dateTo?: string;
  actors: Array<{ id: number; name: string }>;
};

export function AuditLogFilters({ search, module, action, actorId, dateFrom, dateTo, actors }: Props) {
  const selectClass = "h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary";

  return <form className="mt-10 grid gap-3 border-y py-6 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_170px_170px_200px_auto]">
    <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">Cari aktivitas</span><SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder="Cari target, aktivitas, atau user" className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
    <label><span className="sr-only">Filter modul</span><select name="module" defaultValue={module ?? ""} className={selectClass}><option value="">Semua modul</option>{modules.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    <label><span className="sr-only">Filter aktivitas</span><select name="action" defaultValue={action ?? ""} className={selectClass}><option value="">Semua aktivitas</option>{actions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    <label><span className="sr-only">Filter user</span><select name="actor_id" defaultValue={actorId ?? ""} className={selectClass}><option value="">Semua user</option>{actors.map((actor) => <option key={actor.id} value={actor.id}>{actor.name}</option>)}</select></label>
    <button className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] sm:col-span-2 xl:col-span-1">Terapkan</button>
    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 xl:col-span-5 xl:max-w-[560px]">
      <label className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">Dari tanggal<input type="date" name="date_from" defaultValue={dateFrom} className={`${selectClass} mt-2 tabular-nums`} /></label>
      <label className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">Sampai tanggal<input type="date" name="date_to" defaultValue={dateTo} className={`${selectClass} mt-2 tabular-nums`} /></label>
    </div>
  </form>;
}
