import { BookingFlowHeader } from "@/components/public/booking-flow-header";
import { PublicBookingRecoveryForm } from "@/components/public/public-booking-recovery-form";
import { ArrowLeftIcon, CalendarIcon, CheckIcon, ShieldIcon, WalletIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, PublicLandingData } from "@/lib/api/types";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import { recentPublicBookingToken } from "@/lib/public-booking-server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cek status pesanan",
  description: "Temukan kembali booking dan status pembayaran Prama Homestay tanpa login.",
  robots: { index: false, follow: false },
};

export default async function BookingStatusPage() {
  const locale = await serverLocale();
  const [{ data }, recentToken] = await Promise.all([
    apiFetch<ApiItem<PublicLandingData>>("/public/landing", {}, false),
    recentPublicBookingToken(),
  ]);

  return <div className="booking-page min-h-screen bg-surface-low text-foreground">
    <BookingFlowHeader propertyName={data.property.name} logoUrl={data.property.logo_url} locale={locale} />
    <main className="mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />{serverLocalize(locale, "Kembali ke beranda", "Back to home")}</Link>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-start lg:gap-16 xl:gap-24">
        <section className="lg:pt-6">
          <h1 className="max-w-[11ch] text-balance text-[clamp(2.8rem,5.5vw,5.5rem)] leading-[0.96] font-semibold tracking-[-0.04em]">{serverLocalize(locale, "Temukan kembali pesananmu.", "Find your booking again.")}</h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{serverLocalize(locale, "Periksa status reservasi dan pembayaran kapan saja tanpa membuat akun. Kami hanya meminta data yang sudah kamu gunakan saat memesan.", "Check your reservation and payment status at any time without creating an account. We only ask for details you already used when booking.")}</p>

          {recentToken && <div className="mt-10 bg-primary p-6 text-background sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
            <div><p className="font-semibold">{serverLocalize(locale, "Ada pesanan terakhir di perangkat ini", "A recent booking is saved on this device")}</p><p className="mt-2 text-sm leading-6 text-background/70">{serverLocalize(locale, "Buka langsung tanpa memasukkan kode booking lagi.", "Open it directly without entering the booking code again.")}</p></div>
            <Link href={`/booking/payment/${recentToken}`} className="mt-5 inline-flex min-h-12 shrink-0 items-center justify-center bg-background px-5 text-sm font-bold text-foreground transition-transform hover:-translate-y-0.5 sm:mt-0">{serverLocalize(locale, "Lanjutkan pesanan", "Continue booking")}</Link>
          </div>}

          <div className="mt-12 grid gap-7 border-t pt-8 sm:grid-cols-3">
            <div><CalendarIcon className="size-5 text-secondary" /><p className="mt-4 font-semibold">{serverLocalize(locale, "Detail menginap", "Stay details")}</p><p className="mt-2 text-sm leading-6 text-muted">{serverLocalize(locale, "Lihat kamar, tanggal, jumlah tamu, dan total reservasi.", "Review the room, dates, guest count, and reservation total.")}</p></div>
            <div><WalletIcon className="size-5 text-secondary" /><p className="mt-4 font-semibold">{serverLocalize(locale, "Status pembayaran", "Payment status")}</p><p className="mt-2 text-sm leading-6 text-muted">{serverLocalize(locale, "Ketahui apakah bukti masih diperiksa atau sudah diterima.", "See whether your receipt is under review or has been accepted.")}</p></div>
            <div><CheckIcon className="size-5 text-secondary" /><p className="mt-4 font-semibold">{serverLocalize(locale, "Lanjutkan proses", "Continue the process")}</p><p className="mt-2 text-sm leading-6 text-muted">{serverLocalize(locale, "Selesaikan pembayaran atau kirim bukti pengganti bila diperlukan.", "Complete payment or submit a replacement receipt when needed.")}</p></div>
          </div>
          <p className="mt-10 flex max-w-xl items-start gap-3 text-sm leading-6 text-muted"><ShieldIcon className="mt-0.5 size-5 shrink-0 text-secondary" />{serverLocalize(locale, "Demi keamanan, kami tidak memberi tahu apakah kode booking atau kontak yang salah.", "For security, we do not reveal whether the booking code or contact detail was incorrect.")}</p>
        </section>

        <aside className="lg:sticky lg:top-28"><PublicBookingRecoveryForm locale={locale} /></aside>
      </div>
    </main>
  </div>;
}
