import { PaymentForm } from "@/components/payments/payment-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedBookings } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Tambah Pembayaran" };

export default async function CreatePaymentPage() {
  const bookings = await apiFetch<PaginatedBookings>("/internal/bookings?without_payment=1&per_page=50");
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/payments" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke daftar pembayaran</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Tambah pembayaran</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Catat satu ringkasan pembayaran untuk booking. Status lunas dihitung otomatis dari nominal tagihan.</p>{bookings.data.length > 0 ? <PaymentForm bookings={bookings.data} /> : <div className="mt-10 border-y bg-surface py-16 text-center"><h2 className="text-xl font-semibold">Semua booking sudah memiliki pembayaran</h2><p className="mt-3 text-sm text-muted">Buat booking baru atau perbarui pembayaran yang sudah tercatat.</p><Link href="/internal/bookings/new" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">Tambah booking</Link></div>}</main>;
}
