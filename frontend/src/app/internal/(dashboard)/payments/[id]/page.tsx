import { PaymentStatus } from "@/components/payments/payment-status";
import { PaymentReviewActions } from "@/components/payments/payment-review-actions";
import { PaymentProofViewer } from "@/components/payments/payment-proof-viewer";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, Payment } from "@/lib/api/types";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/display-labels";
import { localeCode, serverLocale, serverLocalize } from "@/lib/locale-server";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Detail Pembayaran" };
function Detail({
  label,
  children,
  inverse = false,
}: {
  label: string;
  children: ReactNode;
  inverse?: boolean;
}) {
  return (
    <div className="border-t pt-4">
      <dt
        className={`text-xs font-semibold tracking-[0.08em] uppercase ${inverse ? "text-white/60" : "text-muted"}`}
      >
        {label}
      </dt>
      <dd className={`mt-2 text-sm leading-6 ${inverse ? "text-white" : ""}`}>
        {children}
      </dd>
    </div>
  );
}

export default async function PaymentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const code = localeCode(locale);
  const currency = new Intl.NumberFormat(code, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
  const date = new Intl.DateTimeFormat(code, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const { id } = await params;
  const { success } = await searchParams;
  const { data: payment } = await apiFetch<ApiItem<Payment>>(
    `/internal/payments/${encodeURIComponent(id)}`,
  );
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
      <Link
        href="/internal/payments"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        {t("Kembali ke daftar pembayaran", "Back to payments")}
      </Link>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">
              {payment.payment_code}
            </h1>
            <PaymentStatus
              status={payment.status}
              label={paymentStatusLabel(payment.status, payment.status_label, locale)}
            />
          </div>
          <p className="mt-3 text-base text-muted">
            {t(
              `Pembayaran ${payment.booking.booking_code} atas nama ${payment.booking.guest_name}.`,
              `Payment for ${payment.booking.booking_code} under ${payment.booking.guest_name}.`,
            )}
          </p>
        </div>
        {payment.can_update && (
          <Link
            href={`/internal/payments/${payment.id}/edit`}
            className="inline-flex h-12 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-white hover:bg-[#2f3131]"
          >
            {t("Edit pembayaran", "Edit payment")}
          </Link>
        )}
      </div>
      {success === "updated" && (
        <div
          className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]"
          role="status"
        >
          {t(
            "Perubahan pembayaran berhasil disimpan.",
            "Payment changes were saved successfully.",
          )}
        </div>
      )}
      {(success === "verified" || success === "rejected") && (
        <div
          className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]"
          role="status"
        >
          {success === "verified"
            ? t("Pembayaran berhasil diverifikasi dan status booking telah diperbarui.", "The payment was verified and the booking status was updated.")
            : t("Bukti pembayaran ditolak. Pelanggan dapat mengirim bukti pengganti.", "The payment receipt was rejected. The guest can submit a replacement.")}
        </div>
      )}
      {payment.can_update && payment.status === "pending_verification" && (
        <PaymentReviewActions
          id={payment.id}
          paymentCode={payment.payment_code}
          amountLabel={currency.format(Number(payment.amount_paid))}
        />
      )}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.8fr]">
        <section className="rounded-lg bg-surface p-6 shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)] sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">
            {t("Rincian transaksi", "Transaction details")}
          </h2>
          <dl className="mt-7 grid gap-5 sm:grid-cols-2">
            <Detail label={t("Metode", "Method")}>
              {paymentMethodLabel(payment.method, payment.method_label ?? t("Belum ditentukan", "Not specified"), locale)}
            </Detail>
            <Detail label={t("Tanggal", "Date")}>
              {payment.paid_at
                ? date.format(new Date(payment.paid_at))
                : t("Belum ditentukan", "Not specified")}
            </Detail>
            <Detail label={t("Nomor referensi", "Reference number")}>
              {payment.reference_number ?? t("Tidak ada", "None")}
            </Detail>
            <Detail label="Booking">
              <Link
                href={`/internal/bookings/${payment.booking.id}`}
                className="font-semibold text-secondary underline underline-offset-4"
              >
                {payment.booking.booking_code}
              </Link>
            </Detail>
          </dl>
          <p className="mt-8 border-t pt-6 text-sm leading-7 text-muted">
            {payment.notes ||
              t("Belum ada catatan transaksi.", "No transaction notes yet.")}
          </p>
        </section>
        <section className="rounded-lg bg-primary p-6 text-white sm:p-8">
          <h2 className="text-xl font-semibold">
            {t("Ringkasan tagihan", "Charge summary")}
          </h2>
          <dl className="mt-6 grid gap-5">
            <Detail label={t("Total booking", "Booking total")} inverse>
              {currency.format(Number(payment.booking.total_amount))}
            </Detail>
            <Detail label={t("Nominal tercatat", "Recorded amount")} inverse>
              {currency.format(Number(payment.amount_paid))}
            </Detail>
            <Detail label={t("Diakui dibayar", "Credited payment")} inverse>
              {currency.format(Number(payment.credited_amount))}
            </Detail>
          </dl>
          <div className="mt-7 border-t border-white/25 pt-6">
            <p className="text-xs font-semibold tracking-[0.08em] text-white/60 uppercase">
              {t("Sisa tagihan", "Outstanding balance")}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {currency.format(Number(payment.remaining_amount))}
            </p>
          </div>
        </section>
      </div>
      <section className="mt-8 border-t pt-7">
        <h2 className="text-lg font-semibold">
          {t("Bukti pembayaran", "Payment receipt")}
        </h2>
        {payment.proof_url ? (
          <PaymentProofViewer
            src={payment.proof_url}
            alt={t(
              `Bukti pembayaran ${payment.payment_code}`,
              `Payment receipt ${payment.payment_code}`,
            )}
          />
        ) : (
          <p className="mt-3 text-sm leading-7 text-muted">
            {t(
              "Belum ada bukti pembayaran yang diunggah.",
              "No payment receipt has been uploaded.",
            )}
          </p>
        )}
      </section>
    </main>
  );
}
