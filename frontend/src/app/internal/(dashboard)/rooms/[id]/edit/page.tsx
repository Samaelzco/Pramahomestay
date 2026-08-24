import { RoomForm } from "@/components/rooms/room-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { LocalizedText } from "@/components/ui/localized-text";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, PaginatedAmenities, Room } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Edit Kamar" };

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [response, amenities] = await Promise.all([apiFetch<ApiItem<Room>>(`/internal/rooms/${encodeURIComponent(id)}`), apiFetch<PaginatedAmenities>("/internal/amenities?per_page=100")]);
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/rooms" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" /><LocalizedText id="Kembali ke daftar kamar" en="Back to rooms" /></Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl"><LocalizedText id={`Edit ${response.data.name}`} en={`Edit ${response.data.name}`} /></h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted"><LocalizedText id="Perbarui kondisi operasional, harga, atau detail fasilitas kamar." en="Update the room's operational condition, rate, or amenity details." /></p><RoomForm room={response.data} amenities={amenities.data} /></main>;
}
