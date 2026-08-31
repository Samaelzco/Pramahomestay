import { PaymentForm } from "@/components/payments/payment-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, Payment } from "@/lib/api/types";
import type { Metadata } from "next";
import { LocalizedText } from "@/components/ui/localized-text";
import Link from "next/link";

export const metadata: Metadata = { title: "Edit Pembayaran" };

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: payment } = await apiFetch<ApiItem<Payment>>(`/internal/payments/${encodeURIComponent(id)}`);
  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href={`/internal/payments/${payment.id}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" /><LocalizedText id="Kembali ke detail pembayaran" en="Back to payment details" /></Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Edit {payment.payment_code}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted"><LocalizedText id="Perbarui nominal, metode, kondisi transaksi, atau bukti pembayaran." en="Update the amount, method, transaction status, or payment receipt." /></p><PaymentForm bookings={[payment.booking]} payment={payment} /></main>;
}
