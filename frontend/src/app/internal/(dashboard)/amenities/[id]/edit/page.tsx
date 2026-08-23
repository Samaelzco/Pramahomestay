import { AmenityForm } from "@/components/amenities/amenity-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { Amenity, ApiItem } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Edit Fasilitas" };

export default async function EditAmenityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await apiFetch<ApiItem<Amenity>>(`/internal/amenities/${encodeURIComponent(id)}`);
  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/amenities" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke fasilitas</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">Edit {response.data.name}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Perbarui nama, deskripsi, atau ketersediaan fasilitas.</p><AmenityForm amenity={response.data} /></main>;
}
