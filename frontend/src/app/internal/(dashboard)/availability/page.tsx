import { AvailabilityCalendar } from "@/components/availability/availability-calendar";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, AvailabilityCalendarData, InternalUser } from "@/lib/api/types";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Kalender Ketersediaan" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;
const iso = (date: Date) => date.toISOString().slice(0, 10);

function shifted(start: string, view: "day" | "week" | "month", direction: -1 | 1): string {
  const date = new Date(`${start}T00:00:00Z`);
  if (view === "month") date.setUTCMonth(date.getUTCMonth() + direction, 1);
  else date.setUTCDate(date.getUTCDate() + direction * (view === "week" ? 7 : 1));
  return iso(date);
}

export default async function AvailabilityPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const params = await searchParams;
  const requestedView = value(params.view);
  const view = (["day", "week", "month"].includes(requestedView ?? "") ? requestedView : "week") as "day" | "week" | "month";
  const start = value(params.start) ?? iso(new Date());
  const query = new URLSearchParams({ view, start });
  const roomId = value(params.room_id);
  if (/^\d+$/.test(roomId ?? "")) query.set("room_id", roomId!);
  const [response, userResponse] = await Promise.all([
    apiFetch<ApiItem<AvailabilityCalendarData>>(`/internal/availability?${query.toString()}`),
    apiFetch<ApiItem<InternalUser>>("/user"),
  ]);
  const data = response.data;
  const dateFormatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const periodEnd = new Date(`${data.period.end}T00:00:00Z`);
  periodEnd.setUTCDate(periodEnd.getUTCDate() - 1);
  const success = value(params.success);
  const canManage = userResponse.data.permissions.includes("rooms.update");
  const blockQuery = new URLSearchParams({ start: data.period.start });
  if (data.filters.room_id) blockQuery.set("room_id", String(data.filters.room_id));
  const hrefFor = (nextView: string, nextStart = data.period.start) => {
    const nextQuery = new URLSearchParams({ view: nextView, start: nextStart });
    if (data.filters.room_id) nextQuery.set("room_id", String(data.filters.room_id));
    return `/internal/availability?${nextQuery.toString()}`;
  };

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1560px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{t("Kalender ketersediaan", "Availability calendar")}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{t("Lihat kamar terisi, menunggu, dan diblokir dalam satu jadwal operasional.", "See occupied, pending, and blocked rooms in one operational schedule.")}</p></div>{canManage && <Link href={`/internal/availability/blocks/new?${blockQuery.toString()}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]"><PlusIcon className="size-4" />{t("Blokir kamar", "Block room")}</Link>}</div>
    {success === "blocked" && <div role="status" className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]">{t("Kamar berhasil diblokir dan sudah dikeluarkan dari ketersediaan publik.", "The room was blocked and removed from public availability.")}</div>}
    <section className="mt-8 flex flex-col gap-4 border-y py-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-2"><Link aria-label={t("Periode sebelumnya", "Previous period")} href={hrefFor(view, shifted(data.period.start, view, -1))} className="grid size-11 place-items-center rounded-sm border bg-surface hover:bg-surface-low"><ArrowLeftIcon className="size-4" /></Link><Link href={hrefFor(view, iso(new Date()))} className="inline-flex h-11 items-center rounded-sm border bg-surface px-4 text-sm font-semibold hover:bg-surface-low">{t("Hari ini", "Today")}</Link><Link aria-label={t("Periode berikutnya", "Next period")} href={hrefFor(view, shifted(data.period.start, view, 1))} className="grid size-11 place-items-center rounded-sm border bg-surface hover:bg-surface-low"><ArrowRightIcon className="size-4" /></Link><p className="ml-2 hidden text-sm font-semibold tabular-nums sm:block">{dateFormatter.format(new Date(`${data.period.start}T00:00:00Z`))} — {dateFormatter.format(periodEnd)}</p></div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="flex min-w-0 gap-2" action="/internal/availability">
          <input type="hidden" name="view" value={view} />
          <input type="hidden" name="start" value={data.period.start} />
          <label className="sr-only" htmlFor="availability-room">{t("Filter kamar", "Filter room")}</label>
          <select id="availability-room" name="room_id" defaultValue={data.filters.room_id ?? ""} className="h-11 min-w-0 flex-1 rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-48">
            <option value="">{t("Semua kamar", "All rooms")}</option>
            {data.room_options.map((room) => <option key={room.id} value={room.id}>{room.name}{room.is_active ? "" : ` · ${t("nonaktif", "inactive")}`}</option>)}
          </select>
          <button type="submit" className="h-11 rounded-sm border bg-surface px-4 text-sm font-semibold transition-colors hover:bg-surface-low">{t("Terapkan", "Apply")}</button>
        </form>
        <div className="grid grid-cols-3 rounded-md bg-surface-low p-1">{([["day", "Hari", "Day"], ["week", "Minggu", "Week"], ["month", "Bulan", "Month"]] as const).map(([key, id, en]) => <Link key={key} href={hrefFor(key)} aria-current={view === key ? "page" : undefined} className={`flex h-10 items-center justify-center rounded-sm px-4 text-sm font-semibold transition-colors ${view === key ? "bg-primary text-white shadow-sm" : "text-muted hover:text-primary"}`}>{t(id, en)}</Link>)}</div>
      </div>
    </section>
    <p className="mt-5 text-sm font-semibold tabular-nums sm:hidden">{dateFormatter.format(new Date(`${data.period.start}T00:00:00Z`))} — {dateFormatter.format(periodEnd)}</p>
    <AvailabilityCalendar data={data} locale={locale} canManage={canManage} />
  </main>;
}
