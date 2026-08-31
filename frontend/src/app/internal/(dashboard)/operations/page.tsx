import { OperationBoard } from "@/components/operations/operation-board";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, DailyOperations, InternalUser } from "@/lib/api/types";
import { localeCode, serverLocale, serverLocalize } from "@/lib/locale-server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Operasional Harian" };
type SearchParams = Record<string, string | string[] | undefined>;
const iso = (date: Date) => date.toISOString().slice(0, 10);
const validDate = (value?: string) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");
function shift(value: string, days: number) { const date = new Date(`${value}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return iso(date); }

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return <div className="py-6 sm:px-6 sm:first:pl-0"><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">{label}</p><p className="mt-2 text-3xl font-semibold tracking-[-0.03em] tabular-nums">{value}</p><p className="mt-1 text-xs text-muted">{note}</p></div>;
}

export default async function OperationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const params = await searchParams;
  const requested = typeof params.date === "string" ? params.date : undefined;
  const selected = validDate(requested) ? requested! : iso(new Date());
  const [response, userResponse] = await Promise.all([
    apiFetch<ApiItem<DailyOperations>>(`/internal/operations?date=${selected}`),
    apiFetch<ApiItem<InternalUser>>("/user"),
  ]);
  const data = response.data;
  const formatter = new Intl.DateTimeFormat(localeCode(locale), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const isToday = data.date === data.today;

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{t("Operasional harian", "Daily operations")}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{t("Selesaikan kedatangan, keberangkatan, dan kesiapan kamar dari satu antrean kerja.", "Complete arrivals, departures, and room readiness from one work queue.")}</p></div><Link href="/internal/availability" className="inline-flex h-12 items-center justify-center rounded-sm border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-low">{t("Lihat kalender kamar", "View room calendar")}</Link></div>
    <section className="mt-8 flex flex-col gap-4 border-y py-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><Link aria-label={t("Hari sebelumnya", "Previous day")} href={`/internal/operations?date=${shift(data.date, -1)}`} className="grid size-11 place-items-center rounded-sm border bg-surface hover:bg-surface-low"><ArrowLeftIcon className="size-4" /></Link><Link href="/internal/operations" aria-current={isToday ? "date" : undefined} className={`inline-flex h-11 items-center rounded-sm px-4 text-sm font-semibold ${isToday ? "bg-primary text-white" : "border bg-surface hover:bg-surface-low"}`}>{t("Hari ini", "Today")}</Link><Link aria-label={t("Hari berikutnya", "Next day")} href={`/internal/operations?date=${shift(data.date, 1)}`} className="grid size-11 place-items-center rounded-sm border bg-surface hover:bg-surface-low"><ArrowRightIcon className="size-4" /></Link></div><p className="text-sm font-semibold capitalize tabular-nums">{formatter.format(new Date(`${data.date}T00:00:00Z`))}</p></section>
    <section className="grid grid-cols-2 gap-x-5 border-b sm:grid-cols-4 sm:divide-x"><Metric label={t("Perlu check-in", "Check-ins due")} value={data.summary.arrivals_due} note={t("belum diproses", "not processed")} /><Metric label={t("Perlu check-out", "Check-outs due")} value={data.summary.departures_due} note={t("belum diproses", "not processed")} /><Metric label={t("Sedang ditempati", "Occupied")} value={data.summary.occupied_rooms} note={t("kamar", "rooms")} /><Metric label="Housekeeping" value={data.summary.cleaning_rooms} note={t("menunggu siap", "awaiting readiness")} /></section>
    <OperationBoard data={data} canUpdateBookings={userResponse.data.permissions.includes("bookings.update")} canUpdateRooms={userResponse.data.permissions.includes("rooms.update")} />
  </main>;
}
