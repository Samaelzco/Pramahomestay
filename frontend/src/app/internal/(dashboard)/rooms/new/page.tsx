import { RoomForm } from "@/components/rooms/room-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Tambah Kamar" };

export default function CreateRoomPage() {
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/rooms" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke daftar kamar</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Tambah kamar</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Lengkapi informasi unit agar tim dapat mengelola kesiapan dan harga dengan akurat.</p><RoomForm /></main>;
}
