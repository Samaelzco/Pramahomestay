import { markAllInternalNotificationsReadAction } from "@/app/internal/(dashboard)/notifications/actions";
import { NotificationHistoryList } from "@/components/internal/notification-history-list";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api/client";
import type { InternalNotificationType, PaginatedInternalNotifications } from "@/lib/api/types";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import { pageSize } from "@/lib/pagination";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Notifikasi internal" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

const types: Array<{ value: InternalNotificationType; id: string; en: string }> = [
  { value: "booking_created", id: "Booking baru", en: "New booking" },
  { value: "payment_proof_submitted", id: "Bukti pembayaran", en: "Payment proof" },
  { value: "check_in_due", id: "Check-in", en: "Check-in" },
  { value: "check_out_due", id: "Check-out", en: "Check-out" },
];

export default async function InternalNotificationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const raw = await searchParams;
  const query = {
    status: value(raw.status),
    type: value(raw.type),
    per_page: pageSize(value(raw.per_page)),
    page: value(raw.page),
  };
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, item]) => { if (item) params.set(key, item); });
  const response = await apiFetch<PaginatedInternalNotifications>(`/internal/notifications?${params}`);
  const hasFilters = Boolean(query.status || query.type);
  const selectClass = "h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] md:text-5xl">{t("Notifikasi internal", "Internal notifications")}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            {t("Pantau booking baru, bukti pembayaran, serta jadwal check-in dan check-out yang perlu ditindaklanjuti.", "Track new bookings, payment proofs, and check-in or check-out tasks that need attention.")}
          </p>
        </div>
        {response.unread_count > 0 && (
          <form action={markAllInternalNotificationsReadAction}>
            <button className="min-h-12 w-full rounded-sm border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-low sm:w-auto">
              {t("Tandai semua dibaca", "Mark all read")}
            </button>
          </form>
        )}
      </div>

      <form className="mt-10 grid gap-3 border-y py-6 sm:grid-cols-[minmax(180px,240px)_minmax(200px,280px)_auto]">
        <input type="hidden" name="per_page" value={query.per_page} />
        <label>
          <span className="sr-only">{t("Filter status", "Filter by status")}</span>
          <select name="status" defaultValue={query.status ?? ""} className={selectClass}>
            <option value="">{t("Semua status", "All statuses")}</option>
            <option value="unread">{t("Belum dibaca", "Unread")}</option>
            <option value="read">{t("Sudah dibaca", "Read")}</option>
          </select>
        </label>
        <label>
          <span className="sr-only">{t("Filter kategori", "Filter by category")}</span>
          <select name="type" defaultValue={query.type ?? ""} className={selectClass}>
            <option value="">{t("Semua kategori", "All categories")}</option>
            {types.map((type) => <option key={type.value} value={type.value}>{t(type.id, type.en)}</option>)}
          </select>
        </label>
        <button className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]">
          {t("Terapkan", "Apply")}
        </button>
      </form>

      <div className="mt-8 flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium">{t(`${response.meta.total} notifikasi ditemukan`, `${response.meta.total} notifications found`)}</p>
        {hasFilters && <Link href="/internal/notifications" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">{t("Hapus filter", "Clear filters")}</Link>}
      </div>

      {response.data.length ? (
        <NotificationHistoryList notifications={response.data} locale={locale} timezone={response.timezone} />
      ) : (
        <div className="mt-5 bg-surface py-20 text-center">
          <h2 className="text-xl font-semibold">{hasFilters ? t("Tidak ada hasil", "No results") : t("Belum ada notifikasi", "No notifications yet")}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            {hasFilters
              ? t("Ubah filter untuk melihat notifikasi lainnya.", "Adjust the filters to see other notifications.")
              : t("Booking baru dan tugas operasional penting akan muncul di sini.", "New bookings and important operational tasks will appear here.")}
          </p>
        </div>
      )}

      <Pagination meta={response.meta} query={query} resourceName="notifikasi" resourceNameEn="notifications" />
    </main>
  );
}
