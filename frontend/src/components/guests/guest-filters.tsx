import { SearchIcon } from "@/components/ui/icons";

export function GuestFilters({ search, isActive }: { search?: string; isActive?: string }) {
  return <form className="mt-8 grid gap-3 border-y py-5 sm:grid-cols-[1fr_180px_auto]" method="get">
    <label className="relative"><span className="sr-only">Cari tamu</span><SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder="Cari nama, email, atau nomor telepon" className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
    <label><span className="sr-only">Filter status profil</span><select name="is_active" defaultValue={isActive ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">Semua profil</option><option value="1">Aktif</option><option value="0">Nonaktif</option></select></label>
    <button type="submit" className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]">Terapkan</button>
  </form>;
}
