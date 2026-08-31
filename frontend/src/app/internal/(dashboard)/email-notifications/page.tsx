import { EmailNotificationFilters } from "@/components/email-notifications/email-notification-filters";
import { EmailNotificationList } from "@/components/email-notifications/email-notification-list";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedEmailNotifications } from "@/lib/api/types";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import { pageSize } from "@/lib/pagination";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Notifikasi email" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function EmailNotificationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const locale = await serverLocale(); const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const raw = await searchParams; const query = { search: value(raw.search), status: value(raw.status), type: value(raw.type), per_page: pageSize(value(raw.per_page)), page: value(raw.page) };
  const params = new URLSearchParams(); Object.entries(query).forEach(([key, item]) => { if (item) params.set(key, item); });
  const response = await apiFetch<PaginatedEmailNotifications>(`/internal/email-notifications?${params}`);
  const hasFilters = Boolean(query.search || query.status || query.type);
  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-semibold tracking-[-0.03em] md:text-5xl">{t("Notifikasi email", "Email notifications")}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{t("Pantau email otomatis yang dikirim kepada tamu dan tim internal.", "Monitor automated emails sent to guests and the internal team.")}</p></div><Link href="/internal/settings" className="inline-flex min-h-12 items-center justify-center border bg-surface px-5 text-sm font-semibold hover:bg-surface-low">{t("Atur SMTP", "Configure SMTP")}</Link></div>
    <EmailNotificationFilters search={query.search} status={query.status} type={query.type} perPage={query.per_page} />
    <div className="mt-8 flex items-baseline justify-between gap-4"><p className="text-sm font-medium">{t(`${response.meta.total} notifikasi ditemukan`, `${response.meta.total} notifications found`)}</p>{hasFilters && <Link href="/internal/email-notifications" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">{t("Hapus filter", "Clear filters")}</Link>}</div>
    {response.data.length ? <EmailNotificationList notifications={response.data} /> : <div className="mt-5 bg-surface py-20 text-center"><h2 className="text-xl font-semibold">{t("Belum ada notifikasi", "No notifications yet")}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">{t("Aktifkan SMTP. Aktivitas booking dan pembayaran berikutnya akan tercatat di sini.", "Enable SMTP. Future booking and payment activity will appear here.")}</p></div>}
    <Pagination meta={response.meta} query={query} resourceName="notifikasi" resourceNameEn="notifications" />
  </main>;
}
