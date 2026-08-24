import { AmenityFilters } from "@/components/amenities/amenity-filters";
import { AmenityList } from "@/components/amenities/amenity-list";
import { PlusIcon } from "@/components/ui/icons";
import { LocalizedText } from "@/components/ui/localized-text";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedAmenities } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Fasilitas" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function AmenitiesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = { search: value(params.search), is_active: value(params.is_active), page: value(params.page) };
  const apiParams = new URLSearchParams({ per_page: "15" });
  Object.entries(query).forEach(([key, item]) => { if (item) apiParams.set(key, item); });
  const amenities = await apiFetch<PaginatedAmenities>(`/internal/amenities?${apiParams.toString()}`);
  const success = value(params.success);

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl"><LocalizedText id="Kelola fasilitas" en="Manage amenities" /></h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted"><LocalizedText id="Kelola pilihan fasilitas yang dapat ditautkan ke setiap kamar." en="Manage amenities that can be assigned to each room." /></p></div><Link href="/internal/amenities/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]"><PlusIcon className="size-4" /><LocalizedText id="Tambah fasilitas" en="Add amenity" /></Link></div>
    {success === "created" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status"><LocalizedText id="Fasilitas berhasil ditambahkan." en="The amenity was added successfully." /></div>}
    {success === "updated" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status"><LocalizedText id="Perubahan fasilitas berhasil disimpan." en="Amenity changes were saved successfully." /></div>}
    <AmenityFilters search={query.search} isActive={query.is_active} />
    <div className="mt-8 flex items-baseline justify-between"><p className="text-sm font-medium">{amenities.meta.total} <LocalizedText id="fasilitas ditemukan" en={amenities.meta.total === 1 ? "amenity found" : "amenities found"} /></p>{(query.search || query.is_active) && <Link href="/internal/amenities" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline"><LocalizedText id="Hapus filter" en="Clear filters" /></Link>}</div>
    {amenities.data.length ? <AmenityList amenities={amenities.data} /> : <div className="mt-5 rounded-lg bg-surface py-20 text-center shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><h2 className="text-xl font-semibold"><LocalizedText id="Belum ada fasilitas yang sesuai" en="No matching amenities" /></h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted"><LocalizedText id="Ubah filter atau tambahkan fasilitas baru untuk digunakan pada kamar." en="Adjust the filters or add a new amenity for your rooms." /></p><Link href="/internal/amenities/new" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white"><LocalizedText id="Tambah fasilitas" en="Add amenity" /></Link></div>}
    <Pagination meta={amenities.meta} query={query} resourceName="fasilitas" resourceNameEn="Amenities" />
  </main>;
}
