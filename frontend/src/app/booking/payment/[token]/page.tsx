import { BookingFlowHeader } from "@/components/public/booking-flow-header";
import { BookingCodePanel } from "@/components/public/booking-code-panel";
import { BookingProgress } from "@/components/public/booking-progress";
import { PublicPaymentProofForm } from "@/components/public/public-payment-proof-form";
import { ArrowLeftIcon, CalendarIcon, CheckIcon, ShieldIcon, WalletIcon } from "@/components/ui/icons";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ApiItem, PublicPaymentData } from "@/lib/api/types";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Pembayaran booking",
  description: "Selesaikan pembayaran booking Prama Homestay dengan aman.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ token: string }>; searchParams: Promise<{ submitted?: string }> };

function money(value: string, locale: "id" | "en") {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
}

export default async function PublicPaymentPage({ params, searchParams }: PageProps) {
  const locale = await serverLocale();
  const { token } = await params;
  const query = await searchParams;
  let data: PublicPaymentData;
  try {
    data = (await apiFetch<ApiItem<PublicPaymentData>>(`/public/payments/${token}`, {}, false)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { property, booking, payment } = data;
  const accountReady = Boolean(property.bank_name && property.bank_account_number && property.bank_account_holder);
  const proofPending = payment?.status === "pending_verification";
  const paid = payment?.status === "paid";
  const blocked = !proofPending && !paid && (booking.payment_expired || booking.status === "cancelled");
  const due = booking.payment_due_at ? new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(booking.payment_due_at)) : null;
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Makassar" });

  return <div className="booking-page min-h-screen bg-surface-low text-foreground">
    <BookingFlowHeader propertyName={property.name} locale={locale} />
    <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />{serverLocalize(locale, "Kembali ke beranda", "Back to home")}</Link>
      <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-end">
        <div className="min-w-0"><h1 className="max-w-[13ch] text-balance text-[clamp(2.65rem,4.5vw,4.7rem)] leading-[0.96] font-semibold tracking-[-0.04em]">{paid ? serverLocalize(locale, "Pembayaran selesai.", "Payment complete.") : proofPending ? serverLocalize(locale, "Bukti sedang kami periksa.", "We are reviewing your receipt.") : serverLocalize(locale, "Selesaikan reservasinya.", "Complete your reservation.")}</h1><p className="mt-5 max-w-2xl leading-7 text-muted">{paid ? serverLocalize(locale, "Pembayaran telah diterima dan booking sudah dikonfirmasi.", "Your payment has been received and the booking is confirmed.") : proofPending ? serverLocalize(locale, "Tidak perlu mengunggah ulang. Tim kami akan memverifikasi transaksi ini.", "No need to upload again. Our team will verify this transaction.") : serverLocalize(locale, "Transfer sesuai total tagihan, lalu kirim bukti pembayaran agar tim kami dapat memverifikasinya.", "Transfer the exact total, then submit your receipt for verification.")}</p></div>
        <BookingProgress current={4} locale={locale} />
      </div>

      <BookingCodePanel bookingCode={booking.booking_code} locale={locale} />

      {(query.submitted === "1" || proofPending || paid) && <div className="mt-8 flex gap-4 bg-[#e3f3e8] p-5 text-[#28533b]"><span className="grid size-10 shrink-0 place-items-center bg-white/60"><CheckIcon className="size-5" /></span><div><p className="font-semibold">{paid ? serverLocalize(locale, "Pembayaran terverifikasi", "Payment verified") : serverLocalize(locale, "Bukti pembayaran terkirim", "Payment proof submitted")}</p><p className="mt-1 text-sm leading-6">{paid ? serverLocalize(locale, "Reservasimu sudah dikonfirmasi.", "Your reservation is now confirmed.") : serverLocalize(locale, "Status akan diperbarui setelah tim memeriksa transaksi.", "The status will update after our team reviews the transaction.")}</p></div></div>}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_26rem] xl:items-start">
        <section className="order-2 xl:order-none xl:col-start-1 xl:row-span-2 xl:row-start-1">
          <div className="grid gap-4 bg-surface p-5 shadow-[0_22px_60px_-45px_rgba(0,0,0,0.45)] sm:p-7 md:grid-cols-2">
            <article className="order-2 bg-background p-6 md:order-none"><div className="flex items-center gap-3"><WalletIcon className="size-5 text-secondary" /><h2 className="text-xl font-semibold">{serverLocalize(locale, "Tujuan pembayaran", "Payment destination")}</h2></div>{accountReady ? <dl className="mt-7 grid gap-5 text-sm"><div><dt className="text-muted">Bank</dt><dd className="mt-1 font-semibold">{property.bank_name}</dd></div><div className="min-w-0"><dt className="text-muted">{serverLocalize(locale, "Nomor rekening", "Account number")}</dt><dd className="mt-1 break-all text-2xl font-semibold tracking-[-0.02em] tabular-nums">{property.bank_account_number}</dd></div><div><dt className="text-muted">{serverLocalize(locale, "Atas nama", "Account holder")}</dt><dd className="mt-1 font-semibold">{property.bank_account_holder}</dd></div></dl> : <p className="mt-6 text-sm leading-6 text-muted">{serverLocalize(locale, "Detail rekening belum tersedia. Hubungi pengelola sebelum melakukan pembayaran.", "Bank details are not available yet. Contact the property before making a payment.")}</p>}</article>
            <article className="order-1 bg-primary p-6 text-background md:order-none"><p className="text-sm text-background/70">{serverLocalize(locale, "Total yang harus dibayar", "Total amount due")}</p><p className="mt-3 break-words text-[clamp(2rem,5vw,3.3rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums">{money(booking.total_amount, locale)}</p><div className="mt-8 border-t border-background/15 pt-5"><p className="text-xs text-background/65">{serverLocalize(locale, "Batas pembayaran", "Payment deadline")}</p><p className="mt-2 font-semibold">{due ?? "—"}</p></div></article>
          </div>
          {property.payment_instructions && <div className="mt-4 bg-background p-6 sm:p-7"><h2 className="font-semibold">{serverLocalize(locale, "Petunjuk pembayaran", "Payment instructions")}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{property.payment_instructions}</p></div>}
        </section>

        <aside className="order-1 bg-background p-6 xl:col-start-2 xl:row-start-1">
          <h2 className="text-xs font-semibold tracking-[0.1em] text-secondary uppercase">{serverLocalize(locale, "Ringkasan", "Summary")}</h2>
          <div className="mt-4 flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate font-semibold">{booking.room_name}</p><p className="mt-1 truncate text-sm text-muted">{booking.guest_name}</p></div><p className="shrink-0 font-bold tabular-nums">{money(booking.total_amount, locale)}</p></div>
          <dl className="mt-5 grid gap-4 border-t pt-5 text-sm"><div className="grid gap-1 min-[420px]:grid-cols-[auto_1fr]"><dt className="inline-flex items-center gap-2 text-muted"><CalendarIcon className="size-4" />{serverLocalize(locale, "Menginap", "Stay")}</dt><dd className="min-w-0 break-words font-medium min-[420px]:text-right">{date.format(new Date(`${booking.check_in}T00:00:00+08:00`))} – {date.format(new Date(`${booking.check_out}T00:00:00+08:00`))}</dd></div><div className="flex justify-between gap-5"><dt className="text-muted">{serverLocalize(locale, "Durasi", "Duration")}</dt><dd className="font-medium">{booking.total_nights} {serverLocalize(locale, "malam", "nights")}</dd></div><div className="flex justify-between gap-5"><dt className="text-muted">{serverLocalize(locale, "Tamu", "Guests")}</dt><dd className="font-medium">{booking.guest_count}</dd></div></dl>
        </aside>

        <section className="order-3 min-w-0 max-w-full xl:col-start-2 xl:row-start-2">
          <div className="min-w-0 max-w-full bg-surface p-5 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.45)] sm:p-7 lg:p-9">
            {!paid && !proofPending && !blocked && accountReady && <PublicPaymentProofForm token={token} locale={locale} />}
            {!paid && !proofPending && !blocked && !accountReady && <div><h2 className="text-xl font-semibold">{serverLocalize(locale, "Pembayaran belum tersedia", "Payment is not available yet")}</h2><p className="mt-3 text-sm leading-6 text-muted">{serverLocalize(locale, "Upload bukti akan tersedia setelah rekening pembayaran dilengkapi oleh pengelola.", "Receipt upload will become available once the property adds its payment account.")}</p></div>}
            {proofPending && <div><h2 className="text-xl font-semibold">{serverLocalize(locale, "Menunggu verifikasi", "Pending verification")}</h2><p className="mt-3 text-sm leading-6 text-muted">{serverLocalize(locale, "Bukti sudah tersimpan. Tim kami akan memeriksa transaksi ini.", "Your receipt is saved. Our team will review this transaction.")}</p></div>}
            {paid && <div><h2 className="text-xl font-semibold">{serverLocalize(locale, "Reservasi dikonfirmasi", "Reservation confirmed")}</h2><p className="mt-3 text-sm leading-6 text-muted">{serverLocalize(locale, "Tidak ada tindakan pembayaran lain yang diperlukan.", "No further payment action is required.")}</p></div>}
            {blocked && <div><h2 className="text-xl font-semibold text-danger">{booking.status === "cancelled" ? serverLocalize(locale, "Booking telah dibatalkan", "Booking cancelled") : serverLocalize(locale, "Batas pembayaran telah berakhir", "Payment deadline expired")}</h2><p className="mt-3 text-sm leading-6 text-muted">{serverLocalize(locale, "Hubungi pengelola untuk memeriksa ketersediaan dan melanjutkan reservasi.", "Contact the property to check availability and continue your reservation.")}</p></div>}
            {!paid && !proofPending && !blocked && <Link href="/" className="mt-4 flex min-h-12 items-center justify-center border px-5 text-sm font-semibold transition-colors hover:bg-surface-low">{serverLocalize(locale, "Bayar nanti", "Pay later")}</Link>}
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted"><ShieldIcon className="mt-0.5 size-4 shrink-0" />{serverLocalize(locale, "Tautan ini bersifat pribadi. Jangan membagikannya kepada orang lain.", "This link is private. Do not share it with others.")}</p>
        </section>
      </div>
    </main>
  </div>;
}
