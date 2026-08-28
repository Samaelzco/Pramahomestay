import { TrendChart } from "@/components/dashboard/trend-chart";
import { DailyDataDisclosure } from "@/components/dashboard/daily-data-disclosure";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, DashboardBookingRow, DashboardSummary } from "@/lib/api/types";
import { localeCode, serverLocale, serverLocalize } from "@/lib/locale-server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ringkasan" };

const periods = [7, 30, 90] as const;

const validDate = (value?: string) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

function StatusBars({ title, rows, dataLabel }: { title: string; rows: Array<{ status: string; label: string; count: number }>; dataLabel: string }) {
  const total = Math.max(rows.reduce((sum, row) => sum + row.count, 0), 1);
  return <section><div className="flex items-baseline justify-between gap-4"><h2 className="text-lg font-semibold">{title}</h2><span className="text-xs text-muted">{total === 1 && rows.every((row) => row.count === 0) ? 0 : total} {dataLabel}</span></div><div className="mt-5 space-y-4">{rows.map((row) => <div key={row.status}><div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="text-muted">{row.label}</span><span className="font-semibold tabular-nums">{row.count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-surface-high"><div className="h-full rounded-full bg-secondary" style={{ width: `${(row.count / total) * 100}%` }} /></div></div>)}</div></section>;
}

function OperationList({ title, count, rows, empty, arrival, formatDate }: { title: string; count: number; rows: DashboardBookingRow[]; empty: string; arrival: boolean; formatDate: (value: string) => string }) {
  return <section className="border-t pt-6 first:border-t-0 first:pt-0"><div className="flex items-center justify-between gap-4"><h3 className="font-semibold">{title}</h3><span className="text-sm font-semibold tabular-nums text-secondary">{count}</span></div>{rows.length ? <ul className="mt-4 divide-y">{rows.map((row) => <li key={row.id} className="py-4 first:pt-0"><Link href={`/internal/bookings/${row.id}`} className="group flex items-start justify-between gap-4"><span><span className="block text-sm font-semibold group-hover:text-secondary">{row.guest_name}</span><span className="mt-1 block text-xs text-muted">{row.room_name} · {row.booking_code}</span></span><span className="text-xs text-muted">{formatDate(arrival ? row.check_in : row.check_out)}</span></Link></li>)}</ul> : <p className="mt-3 text-sm leading-6 text-muted">{empty}</p>}</section>;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ days?: string; from?: string; to?: string }> }) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const code = localeCode(locale);
  const currency = (value: number | string) => new Intl.NumberFormat(code, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
  const date = (value: string) => new Intl.DateTimeFormat(code, { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
  const params = await searchParams;
  const requested = Number(params.days);
  const custom = validDate(params.from) && validDate(params.to) && params.from! <= params.to!;
  const days = custom ? null : periods.includes(requested as (typeof periods)[number]) ? requested as 7 | 30 | 90 : 30;
  const query = custom ? `from=${params.from}&to=${params.to}` : `days=${days}`;
  const { data } = await apiFetch<ApiItem<DashboardSummary>>(`/internal/dashboard?${query}`);
  const granularityCopy = { day: { noun: t("hari", "day"), description: t("per hari", "per day") }, week: { noun: t("minggu", "week"), description: t("per minggu", "per week") }, month: { noun: t("bulan", "month"), description: t("per bulan", "per month") } } as const;
  const seriesCopy = granularityCopy[data.period.granularity];
  const periodNote = data.period.is_custom ? `${date(data.period.start)}–${date(data.period.end)}` : t(`Dalam ${data.period.days} hari`, `Over ${data.period.days} days`);
  const bookingLabels: Record<string, string> = { pending: "Pending", confirmed: "Confirmed", checked_in: "Checked in", checked_out: "Checked out", cancelled: "Cancelled" };
  const paymentLabels: Record<string, string> = { unpaid: "Unpaid", pending_verification: "Pending verification", partial: "Partially paid", paid: "Paid", failed: "Failed", refunded: "Refunded" };
  const bookingStatuses = data.booking_statuses.map((row) => ({ ...row, label: locale === "en" ? bookingLabels[row.status] ?? row.label : row.label }));
  const paymentStatuses = data.payment_statuses.map((row) => ({ ...row, label: locale === "en" ? paymentLabels[row.status] ?? row.label : row.label }));

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-6 border-b pb-8 xl:flex-row xl:items-end xl:justify-between"><div className="min-w-0"><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{t("Ringkasan operasional", "Operations overview")}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{t("Satu pandangan untuk performa homestay, agenda tamu, dan pembayaran yang perlu ditindaklanjuti.", "A single view of homestay performance, guest schedules, and payments that need attention.")}</p></div><PeriodFilter activeDays={days} custom={custom} initialFrom={data.period.start} initialTo={data.period.end} /></div>

    <section aria-label="Metrik utama" className="grid border-b sm:grid-cols-2 xl:grid-cols-4">{[
      [t("Pendapatan", "Revenue"), currency(data.metrics.revenue), periodNote],
      [t("Booking masuk", "New bookings"), data.metrics.bookings.toLocaleString(code), t(`Dibuat sejak ${date(data.period.start)}`, `Created since ${date(data.period.start)}`)],
      [t("Okupansi hari ini", "Today's occupancy"), `${data.metrics.occupancy_rate}%`, t(`${data.metrics.occupied_rooms} dari ${data.metrics.active_rooms} kamar aktif`, `${data.metrics.occupied_rooms} of ${data.metrics.active_rooms} active rooms`)],
      [t("Sisa tagihan", "Outstanding balance"), currency(data.metrics.outstanding), t("Dari booking yang masih aktif", "From active bookings")],
    ].map(([label, value, note], index) => <div key={label} className={`py-8 sm:px-7 ${index % 2 ? "sm:border-l" : ""} ${index > 1 ? "sm:border-t xl:border-t-0" : ""} ${index > 0 ? "border-t sm:border-t-0" : ""} ${index > 0 ? "xl:border-l" : ""} sm:first:pl-0 xl:first:pl-0`}><p className="text-sm text-muted">{label}</p><p className="mt-3 text-3xl font-semibold tracking-[-0.03em] tabular-nums">{value}</p><p className="mt-2 text-xs leading-5 text-muted">{note}</p></div>)}</section>

    <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><div className="flex flex-col gap-2 border-b px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8"><div><h2 className="text-2xl font-semibold tracking-[-0.02em]">{t("Pergerakan usaha", "Business trends")}</h2><p className="mt-2 text-sm text-muted">{date(data.period.start)}—{date(data.period.end)}</p></div><p className="text-sm text-muted">{t(`Dikelompokkan per ${seriesCopy.noun}`, `Grouped by ${seriesCopy.noun}`)}</p></div><div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-2"><TrendChart title={t("Pendapatan", "Revenue")} description={t(`Pembayaran valid ${seriesCopy.description}`, `Valid payments ${seriesCopy.description}`)} granularity={data.period.granularity} points={data.series.map((row) => ({ date: row.date, endDate: row.end_date, value: Number(row.revenue) }))} valueFormat="currency" /><TrendChart title={t("Okupansi", "Occupancy")} description={t(`Rata-rata kamar terisi ${seriesCopy.description}`, `Average occupied rooms ${seriesCopy.description}`)} granularity={data.period.granularity} points={data.series.map((row) => ({ date: row.date, endDate: row.end_date, value: row.occupancy_rate }))} valueFormat="percent" maxValue={100} /></div><DailyDataDisclosure rows={data.series} granularity={data.period.granularity} /></section>

      <aside aria-label={t("Agenda hari ini", "Today's schedule")} className="rounded-lg bg-primary px-6 py-7 text-white shadow-[0_18px_42px_-28px_rgba(17,17,17,0.55)]"><div className="flex items-end justify-between gap-4 border-b border-white/20 pb-5"><div><h2 className="text-xl font-semibold">{t("Hari ini", "Today")}</h2><p className="mt-1 text-sm text-white/70">{date(data.operations.date)}</p></div><span className="text-3xl font-semibold tabular-nums">{data.metrics.arrivals_today + data.metrics.departures_today}</span></div><div className="mt-6 space-y-7 [&_a]:text-white [&_span.text-muted]:text-white/65 [&_p.text-muted]:text-white/65 [&_section]:border-white/20"><OperationList title={t("Tiba", "Arrivals")} arrival count={data.metrics.arrivals_today} rows={data.operations.arrivals} empty={t("Tidak ada tamu yang dijadwalkan tiba.", "No guests are scheduled to arrive.")} formatDate={date} /><OperationList title={t("Berangkat", "Departures")} arrival={false} count={data.metrics.departures_today} rows={data.operations.departures} empty={t("Tidak ada tamu yang dijadwalkan berangkat.", "No guests are scheduled to depart.")} formatDate={date} /></div></aside>
    </div>

    <div className="mt-10 grid gap-8 lg:grid-cols-2"><div className="rounded-lg bg-surface p-6 shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)] sm:p-8"><StatusBars title={t("Status booking", "Booking status")} rows={bookingStatuses} dataLabel={t("data", "records")} /></div><div className="rounded-lg bg-surface p-6 shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)] sm:p-8"><StatusBars title={t("Status pembayaran", "Payment status")} rows={paymentStatuses} dataLabel={t("data", "records")} /></div></div>

    <div className="mt-10 grid gap-8 xl:grid-cols-2"><section><div className="flex items-end justify-between gap-5"><div><h2 className="text-2xl font-semibold tracking-[-0.02em]">{t("Booking terbaru", "Recent bookings")}</h2><p className="mt-2 text-sm text-muted">{t("Aktivitas reservasi terakhir.", "Latest reservation activity.")}</p></div><Link href="/internal/bookings" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">{t("Semua booking", "All bookings")}</Link></div><div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">{data.recent_bookings.length ? <ul className="divide-y">{data.recent_bookings.map((row) => <li key={row.id}><Link href={`/internal/bookings/${row.id}`} className="grid gap-2 px-5 py-5 transition-colors hover:bg-surface-low sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"><span><span className="font-semibold">{row.guest_name}</span><span className="mt-1 block text-sm text-muted">{row.booking_code} · {row.room_name}</span></span><span className="text-sm text-muted">{date(row.check_in)}</span></Link></li>)}</ul> : <p className="px-6 py-12 text-center text-sm text-muted">{t("Belum ada booking.", "No bookings yet.")}</p>}</div></section>
      <section><div className="flex items-end justify-between gap-5"><div><h2 className="text-2xl font-semibold tracking-[-0.02em]">{t("Perlu ditagih", "Payment follow-up")}</h2><p className="mt-2 text-sm text-muted">{t("Booking aktif dengan pembayaran belum lunas.", "Active bookings with outstanding payments.")}</p></div><Link href="/internal/payments" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">{t("Kelola pembayaran", "Manage payments")}</Link></div><div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">{data.payment_followups.length ? <ul className="divide-y">{data.payment_followups.map((row) => <li key={row.id}><Link href={`/internal/bookings/${row.id}`} className="grid gap-3 px-5 py-5 transition-colors hover:bg-surface-low sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"><span><span className="font-semibold">{row.guest_name}</span><span className="mt-1 block text-sm text-muted">{row.booking_code} · {locale === "en" ? paymentLabels[row.payment_status] ?? row.payment_status_label : row.payment_status_label}</span></span><span className="font-semibold tabular-nums">{currency(row.remaining_amount)}</span></Link></li>)}</ul> : <p className="px-6 py-12 text-center text-sm text-muted">{t("Semua booking aktif sudah lunas.", "All active bookings are fully paid.")}</p>}</div></section>
    </div>
  </main>;
}
