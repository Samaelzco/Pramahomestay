import { GuestForm } from "@/components/guests/guest-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import type { Metadata } from "next";
import { LocalizedText } from "@/components/ui/localized-text";
import Link from "next/link";

export const metadata: Metadata = { title: "Tambah Tamu" };

export default function CreateGuestPage() {
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/guests" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" /><LocalizedText id="Kembali ke daftar tamu" en="Back to guests" /></Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl"><LocalizedText id="Tambah tamu" en="Add guest" /></h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted"><LocalizedText id="Buat profil kontak yang dapat digunakan kembali ketika mencatat booking." en="Create a reusable contact profile for future bookings." /></p><GuestForm /></main>;
}
