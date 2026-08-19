import { SearchIcon } from "@/components/ui/icons";

export function UserFilters({ search, role, isActive }: { search?: string; role?: string; isActive?: string }) {
  return <form className="mt-10 grid gap-3 border-y py-6 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_190px_190px_auto]">
    <label className="relative sm:col-span-2 lg:col-span-1"><span className="sr-only">Cari user</span><SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder="Cari nama atau email" className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
    <label><span className="sr-only">Filter role</span><select name="role" defaultValue={role ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">Semua role</option><option value="admin">Administrator</option><option value="staff">Staff</option></select></label>
    <label><span className="sr-only">Filter status</span><select name="is_active" defaultValue={isActive ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">Semua status</option><option value="1">Aktif</option><option value="0">Nonaktif</option></select></label>
    <button className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] sm:col-span-2 lg:col-span-1">Terapkan</button>
  </form>;
}
