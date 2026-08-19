import { SearchIcon } from "@/components/ui/icons";

export function RoomFilters({ search, status, type }: { search?: string; status?: string; type?: string }) {
  return (
    <form className="mt-8 grid gap-3 border-y py-5 sm:grid-cols-2 xl:grid-cols-[1fr_190px_190px_auto]" method="get">
      <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">Cari kamar</span><SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder="Cari nama atau deskripsi kamar" className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
      <label><span className="sr-only">Filter status</span><select name="status" defaultValue={status ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">Semua status</option><option value="ready">Siap</option><option value="occupied">Terisi</option><option value="cleaning">Dibersihkan</option><option value="maintenance">Perawatan</option></select></label>
      <label><span className="sr-only">Filter tipe</span><select name="type" defaultValue={type ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">Semua tipe</option><option value="studio">Studio</option><option value="suite">Suite</option><option value="loft">Loft</option><option value="deluxe">Deluxe</option></select></label>
      <button type="submit" className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] sm:col-span-2 xl:col-span-1">Terapkan</button>
    </form>
  );
}
