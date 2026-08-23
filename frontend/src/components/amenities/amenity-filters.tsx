import { SearchIcon } from "@/components/ui/icons";

export function AmenityFilters({ search, isActive }: { search?: string; isActive?: string }) {
  return <form className="mt-10 grid gap-3 border-y py-6 sm:grid-cols-[minmax(260px,1fr)_190px_auto]">
    <label className="relative"><span className="sr-only">Cari fasilitas</span><SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder="Cari nama atau deskripsi fasilitas" className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
    <label><span className="sr-only">Filter status</span><select name="is_active" defaultValue={isActive ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">Semua status</option><option value="1">Aktif</option><option value="0">Nonaktif</option></select></label>
    <button className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]">Terapkan</button>
  </form>;
}
