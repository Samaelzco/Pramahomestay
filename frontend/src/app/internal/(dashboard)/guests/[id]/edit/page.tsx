import { GuestForm } from "@/components/guests/guest-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, Guest } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Edit Tamu" };

export default async function EditGuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: guest } = await apiFetch<ApiItem<Guest>>(`/internal/guests/${encodeURIComponent(id)}`);
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href={`/internal/guests/${guest.id}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke profil tamu</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Edit {guest.full_name}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Perbarui profil utama tanpa mengubah snapshot kontak pada booking lama.</p><GuestForm guest={guest} /></main>;
}
