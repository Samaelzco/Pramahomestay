import { PaymentStatus } from "@/components/payments/payment-status";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, Payment } from "@/lib/api/types";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Detail Pembayaran" };
const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
function Detail({ label, children, inverse = false }: { label: string; children: ReactNode; inverse?: boolean }) { return <div className="border-t pt-4"><dt className={`text-xs font-semibold tracking-[0.08em] uppercase ${inverse ? "text-white/60" : "text-muted"}`}>{label}</dt><dd className={`mt-2 text-sm leading-6 ${inverse ? "text-white" : ""}`}>{children}</dd></div>; }

export default async function PaymentDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string }> }) {
  const { id } = await params; const { success } = await searchParams;
  const { data: payment } = await apiFetch<ApiItem<Payment>>(`/internal/payments/${encodeURIComponent(id)}`);
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <Link href="/internal/payments" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke daftar pembayaran</Link>
    <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{payment.payment_code}</h1><PaymentStatus status={payment.status} label={payment.status_label} /></div><p className="mt-3 text-base text-muted">Pembayaran {payment.booking.booking_code} atas nama {payment.booking.guest_name}.</p></div><Link href={`/internal/payments/${payment.id}/edit`} className="inline-flex h-12 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-white hover:bg-[#2f3131]">Edit pembayaran</Link></div>
    {success === "updated" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">Perubahan pembayaran berhasil disimpan.</div>}
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.8fr]"><section className="rounded-lg bg-surface p-6 shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)] sm:p-8"><h2 className="text-2xl font-semibold tracking-[-0.02em]">Rincian transaksi</h2><dl className="mt-7 grid gap-5 sm:grid-cols-2"><Detail label="Metode">{payment.method_label ?? "Belum ditentukan"}</Detail><Detail label="Tanggal">{payment.paid_at ? date.format(new Date(payment.paid_at)) : "Belum ditentukan"}</Detail><Detail label="Nomor referensi">{payment.reference_number ?? "Tidak ada"}</Detail><Detail label="Booking"><Link href={`/internal/bookings/${payment.booking.id}`} className="font-semibold text-secondary underline underline-offset-4">{payment.booking.booking_code}</Link></Detail></dl><p className="mt-8 border-t pt-6 text-sm leading-7 text-muted">{payment.notes || "Belum ada catatan transaksi."}</p></section><section className="rounded-lg bg-primary p-6 text-white sm:p-8"><h2 className="text-xl font-semibold">Ringkasan tagihan</h2><dl className="mt-6 grid gap-5"><Detail label="Total booking" inverse>{currency.format(Number(payment.booking.total_amount))}</Detail><Detail label="Nominal tercatat" inverse>{currency.format(Number(payment.amount_paid))}</Detail><Detail label="Diakui dibayar" inverse>{currency.format(Number(payment.credited_amount))}</Detail></dl><div className="mt-7 border-t border-white/25 pt-6"><p className="text-xs font-semibold tracking-[0.08em] text-white/60 uppercase">Sisa tagihan</p><p className="mt-2 text-3xl font-semibold tabular-nums">{currency.format(Number(payment.remaining_amount))}</p></div></section></div>
    <section className="mt-8 border-t pt-7"><h2 className="text-lg font-semibold">Bukti pembayaran</h2>{payment.proof_url ? <div className="relative mt-5 aspect-[16/9] max-w-2xl overflow-hidden rounded-lg bg-surface-high"><Image src={payment.proof_url} alt={`Bukti pembayaran ${payment.payment_code}`} fill sizes="(max-width: 768px) 100vw, 672px" className="object-contain" /></div> : <p className="mt-3 text-sm leading-7 text-muted">Belum ada bukti pembayaran yang diunggah.</p>}</section>
  </main>;
}
