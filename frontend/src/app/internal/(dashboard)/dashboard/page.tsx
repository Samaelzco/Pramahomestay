import { TrendChart } from "@/components/dashboard/trend-chart";
import { DailyDataDisclosure } from "@/components/dashboard/daily-data-disclosure";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, DashboardBookingRow, DashboardSummary } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ringkasan" };

const currency = (value: number | string) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
const compactCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", maximumFractionDigits: 1 }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
const periods = [7, 30, 90] as const;

function StatusBars({ title, rows }: { title: string; rows: Array<{ status: string; label: string; count: number }> }) {
  const total = Math.max(rows.reduce((sum, row) => sum + row.count, 0), 1);
  return <section><div className="flex items-baseline justify-between gap-4"><h2 className="text-lg font-semibold">{title}</h2><span className="text-xs text-muted">{total === 1 && rows.every((row) => row.count === 0) ? 0 : total} data</span></div><div className="mt-5 space-y-4">{rows.map((row) => <div key={row.status}><div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="text-muted">{row.label}</span><span className="font-semibold tabular-nums">{row.count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-surface-high"><div className="h-full rounded-full bg-secondary" style={{ width: `${(row.count / total) * 100}%` }} /></div></div>)}</div></section>;
}

function OperationList({ title, count, rows, empty }: { title: string; count: number; rows: DashboardBookingRow[]; empty: string }) {
  return <section className="border-t pt-6 first:border-t-0 first:pt-0"><div className="flex items-center justify-between gap-4"><h3 className="font-semibold">{title}</h3><span className="text-sm font-semibold tabular-nums text-secondary">{count}</span></div>{rows.length ? <ul className="mt-4 divide-y">{rows.map((row) => <li key={row.id} className="py-4 first:pt-0"><Link href={`/internal/bookings/${row.id}`} className="group flex items-start justify-between gap-4"><span><span className="block text-sm font-semibold group-hover:text-secondary">{row.guest_name}</span><span className="mt-1 block text-xs text-muted">{row.room_name} · {row.booking_code}</span></span><span className="text-xs text-muted">{title === "Tiba" ? date(row.check_in) : date(row.check_out)}</span></Link></li>)}</ul> : <p className="mt-3 text-sm leading-6 text-muted">{empty}</p>}</section>;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const params = await searchParams;
  const requested = Number(params.days);
  const days = periods.includes(requested as (typeof periods)[number]) ? requested : 30;
  const { data } = await apiFetch<ApiItem<DashboardSummary>>(`/internal/dashboard?days=${days}`);

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Ringkasan operasional</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Satu pandangan untuk performa homestay, agenda tamu, dan pembayaran yang perlu ditindaklanjuti.</p></div><nav aria-label="Periode analitik" className="inline-flex self-start rounded-sm bg-surface-low p-1 sm:self-auto">{periods.map((period) => <Link key={period} href={`/internal/dashboard?days=${period}`} aria-current={days === period ? "page" : undefined} className={`grid h-11 min-w-16 place-items-center rounded-sm px-3 text-sm font-semibold transition-colors ${days === period ? "bg-primary text-white shadow-[0_8px_20px_-14px_rgba(17,17,17,.6)]" : "text-muted hover:bg-surface hover:text-primary"}`}>{period} hari</Link>)}</nav></div>

    <section aria-label="Metrik utama" className="grid border-b sm:grid-cols-2 xl:grid-cols-4">{[
      ["Pendapatan", currency(data.metrics.revenue), `Dalam ${days} hari`],
      ["Booking masuk", data.metrics.bookings.toLocaleString("id-ID"), `Dibuat sejak ${date(data.period.start)}`],
      ["Okupansi hari ini", `${data.metrics.occupancy_rate}%`, `${data.metrics.occupied_rooms} dari ${data.metrics.active_rooms} kamar aktif`],
      ["Sisa tagihan", currency(data.metrics.outstanding), "Dari booking yang masih aktif"],
    ].map(([label, value, note], index) => <div key={label} className={`py-8 sm:px-7 ${index % 2 ? "sm:border-l" : ""} ${index > 1 ? "sm:border-t xl:border-t-0" : ""} ${index > 0 ? "border-t sm:border-t-0" : ""} ${index > 0 ? "xl:border-l" : ""} sm:first:pl-0 xl:first:pl-0`}><p className="text-sm text-muted">{label}</p><p className="mt-3 text-3xl font-semibold tracking-[-0.03em] tabular-nums">{value}</p><p className="mt-2 text-xs leading-5 text-muted">{note}</p></div>)}</section>

    <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><div className="flex flex-col gap-2 border-b px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8"><div><h2 className="text-2xl font-semibold tracking-[-0.02em]">Pergerakan usaha</h2><p className="mt-2 text-sm text-muted">{date(data.period.start)}—{date(data.period.end)}</p></div><p className="text-sm text-muted">Diperbarui dari transaksi tersimpan</p></div><div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-2"><TrendChart title="Pendapatan" description="Pembayaran valid per hari" points={data.series.map((row) => ({ date: row.date, value: Number(row.revenue) }))} formatValue={currency} formatAxis={compactCurrency} /><TrendChart title="Okupansi" description="Persentase kamar terisi per hari" points={data.series.map((row) => ({ date: row.date, value: row.occupancy_rate }))} formatValue={(value) => `${value}%`} formatAxis={(value) => `${Math.round(value)}%`} maxValue={100} /></div><DailyDataDisclosure rows={data.series} /></section>

      <aside aria-label="Agenda hari ini" className="rounded-lg bg-primary px-6 py-7 text-white shadow-[0_18px_42px_-28px_rgba(17,17,17,0.55)]"><div className="flex items-end justify-between gap-4 border-b border-white/20 pb-5"><div><h2 className="text-xl font-semibold">Hari ini</h2><p className="mt-1 text-sm text-white/70">{date(data.period.end)}</p></div><span className="text-3xl font-semibold tabular-nums">{data.metrics.arrivals_today + data.metrics.departures_today}</span></div><div className="mt-6 space-y-7 [&_a]:text-white [&_span.text-muted]:text-white/65 [&_p.text-muted]:text-white/65 [&_section]:border-white/20"><OperationList title="Tiba" count={data.metrics.arrivals_today} rows={data.operations.arrivals} empty="Tidak ada tamu yang dijadwalkan tiba." /><OperationList title="Berangkat" count={data.metrics.departures_today} rows={data.operations.departures} empty="Tidak ada tamu yang dijadwalkan berangkat." /></div></aside>
    </div>

    <div className="mt-10 grid gap-8 lg:grid-cols-2"><div className="rounded-lg bg-surface p-6 shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)] sm:p-8"><StatusBars title="Status booking" rows={data.booking_statuses} /></div><div className="rounded-lg bg-surface p-6 shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)] sm:p-8"><StatusBars title="Status pembayaran" rows={data.payment_statuses} /></div></div>

    <div className="mt-10 grid gap-8 xl:grid-cols-2"><section><div className="flex items-end justify-between gap-5"><div><h2 className="text-2xl font-semibold tracking-[-0.02em]">Booking terbaru</h2><p className="mt-2 text-sm text-muted">Aktivitas reservasi terakhir.</p></div><Link href="/internal/bookings" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">Semua booking</Link></div><div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">{data.recent_bookings.length ? <ul className="divide-y">{data.recent_bookings.map((row) => <li key={row.id}><Link href={`/internal/bookings/${row.id}`} className="grid gap-2 px-5 py-5 transition-colors hover:bg-surface-low sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"><span><span className="font-semibold">{row.guest_name}</span><span className="mt-1 block text-sm text-muted">{row.booking_code} · {row.room_name}</span></span><span className="text-sm text-muted">{date(row.check_in)}</span></Link></li>)}</ul> : <p className="px-6 py-12 text-center text-sm text-muted">Belum ada booking.</p>}</div></section>
      <section><div className="flex items-end justify-between gap-5"><div><h2 className="text-2xl font-semibold tracking-[-0.02em]">Perlu ditagih</h2><p className="mt-2 text-sm text-muted">Booking aktif dengan pembayaran belum lunas.</p></div><Link href="/internal/payments" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">Kelola pembayaran</Link></div><div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">{data.payment_followups.length ? <ul className="divide-y">{data.payment_followups.map((row) => <li key={row.id}><Link href={`/internal/bookings/${row.id}`} className="grid gap-3 px-5 py-5 transition-colors hover:bg-surface-low sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"><span><span className="font-semibold">{row.guest_name}</span><span className="mt-1 block text-sm text-muted">{row.booking_code} · {row.payment_status_label}</span></span><span className="font-semibold tabular-nums">{currency(row.remaining_amount)}</span></Link></li>)}</ul> : <p className="px-6 py-12 text-center text-sm text-muted">Semua booking aktif sudah lunas.</p>}</div></section>
    </div>
  </main>;
}
