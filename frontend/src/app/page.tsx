import { LandingPage } from "@/components/public/landing-page";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, PublicLandingData } from "@/lib/api/types";
import { serverLocale } from "@/lib/locale-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prama Homestay | Menginap Nyaman di Bali",
  description: "Temukan ruang menginap yang tenang, fasilitas yang lengkap, dan akses mudah dari Prama Homestay di Bali.",
};

const landingScrollResetScript = `
  (() => {
    try {
      window.history.scrollRestoration = "manual";
      const navigation = window.performance.getEntriesByType("navigation")[0];
      if (navigation && navigation.type === "reload") {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        window.scrollTo(0, 0);
      }
    } catch {}
  })();
`;

type PageProps = {
  searchParams: Promise<{ check_in?: string; check_out?: string; guests?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const locale = await serverLocale();
  const params = await searchParams;
  const query = new URLSearchParams();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar" }).format(new Date());
  const validCheckIn = /^\d{4}-\d{2}-\d{2}$/.test(params.check_in ?? "") ? params.check_in! : null;
  const validCheckOut = /^\d{4}-\d{2}-\d{2}$/.test(params.check_out ?? "") ? params.check_out! : null;
  const guests = Number(params.guests);

  if (validCheckIn && validCheckOut && validCheckIn >= today && validCheckOut > validCheckIn) {
    query.set("check_in", validCheckIn);
    query.set("check_out", validCheckOut);
  }
  if (Number.isInteger(guests) && guests >= 1 && guests <= 20) query.set("guests", String(guests));

  const payload = await apiFetch<ApiItem<PublicLandingData>>(`/public/landing${query.size ? `?${query}` : ""}`, {}, false);
  return <>
    <script dangerouslySetInnerHTML={{ __html: landingScrollResetScript }} />
    <LandingPage data={payload.data} locale={locale} today={today} />
  </>;
}
