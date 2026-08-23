import { apiFetch } from "@/lib/api/client";
import type { ApiItem, ReportSummary } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Laporan" };

const currency = (value: number | string) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
const date = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
const validDate = (value?: string) => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

function Change({ value, unit = "%" }: { value: number | null; unit?: string }) {
  if (value === null) return <span className="text-muted">Baru pada periode ini</span>;
  const positive = value > 0;
  return <span className={positive ? "text-[#28533b]" : value < 0 ? "text-[#93000a]" : "text-muted"}>{positive ? "+" : ""}{value}{unit} dari periode sebelumnya</span>;
}

function Status({ status, label }: { status: string; label: string }) {
  const tone = status === "paid" ? "bg-[#edf4ef] text-[#28533b]" : status === "partial" ? "bg-secondary-soft text-[#5f411b]" : status === "refunded" || status === "failed" ? "bg-[#ffdad6] text-[#93000a]" : "bg-surface-high text-muted";
  return <span className={`inline-flex rounded-sm px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase ${tone}`}>{label}</span>;
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ date_from?: string; date_to?: string }> }) {
  const params = await searchParams;
  const custom = validDate(params.date_from) && validDate(params.date_to) && params.date_from! <= params.date_to!;
  const query = custom ? `date_from=${params.date_from}&date_to=${params.date_to}` : "";
  const { data } = await apiFetch<ApiItem<ReportSummary>>(`/internal/reports${query ? `?${query}` : ""}`);
  const exportQuery = `date_from=${data.period.start}&date_to=${data.period.end}`;
  const totalPayments = data.payment_methods.reduce((sum, row) => sum + Number(row.amount), 0);

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-7 border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Laporan usaha</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Tinjau pendapatan, okupansi, performa kamar, dan transaksi dalam satu periode.</p></div>
      {data.can_export && <div className="flex flex-wrap gap-3"><a href={`/internal/reports/export?format=csv&${exportQuery}`} className="inline-flex min-h-12 items-center justify-center rounded-sm border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-low">Ekspor CSV</a><a href={`/internal/reports/export?format=pdf&${exportQuery}`} className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]">Ekspor PDF</a></div>}
    </div>

    <form className="grid gap-4 border-b py-6 sm:grid-cols-2 lg:grid-cols-[220px_220px_auto] lg:items-end">
      <label className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">Dari tanggal<input type="date" name="date_from" defaultValue={data.period.start} className="mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm tabular-nums outline-none focus:border-primary" /></label>
      <label className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">Sampai tanggal<input type="date" name="date_to" defaultValue={data.period.end} className="mt-2 h-12 w-full rounded-sm border bg-surface px-4 text-sm tabular-nums outline-none focus:border-primary" /></label>
      <button className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] sm:col-span-2 lg:col-span-1 lg:w-fit">Terapkan periode</button>
    </form>

    <div className="mt-7 flex flex-wrap items-baseline justify-between gap-3"><p className="font-semibold">{date(data.period.start)}—{date(data.period.end)}</p><p className="text-sm text-muted">Dibandingkan dengan {date(data.previous_period.start)}—{date(data.previous_period.end)}</p></div>
    <section aria-label="Ringkasan laporan" className="mt-5 grid border-y sm:grid-cols-2 xl:grid-cols-4">{[
      { label: "Pendapatan", value: currency(data.metrics.revenue), change: <Change value={data.comparison.revenue_percent} /> },
      { label: "Booking masuk", value: data.metrics.bookings.toLocaleString("id-ID"), change: <Change value={data.comparison.bookings_percent} /> },
      { label: "Okupansi", value: `${data.metrics.occupancy_rate}%`, change: <Change value={data.comparison.occupancy_points} unit=" poin" /> },
      { label: "Pembayaran", value: data.metrics.payments.toLocaleString("id-ID"), change: <Change value={data.comparison.payments_percent} /> },
    ].map((metric, index) => <div key={metric.label} className={`py-7 sm:px-7 ${index % 2 ? "sm:border-l" : ""} ${index > 1 ? "border-t xl:border-t-0" : index ? "border-t sm:border-t-0" : ""} ${index > 0 ? "xl:border-l" : ""} sm:first:pl-0 xl:first:pl-0`}><p className="text-sm text-muted">{metric.label}</p><p className="mt-3 text-3xl font-semibold tracking-[-0.03em] tabular-nums">{metric.value}</p><p className="mt-2 text-xs leading-5">{metric.change}</p></div>)}</section>

    <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
      <section><h2 className="text-2xl font-semibold tracking-[-0.02em]">Performa kamar</h2><p className="mt-2 text-sm text-muted">Okupansi dan nilai transaksi setiap unit aktif.</p>
        <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
          <div className="hidden grid-cols-[1.2fr_0.65fr_0.8fr_0.8fr_1fr_1fr] gap-4 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase md:grid"><span>Kamar</span><span>Booking</span><span>Malam</span><span>Okupansi</span><span>Nilai booking</span><span>Pendapatan</span></div>
          <div className="divide-y">{data.rooms.map((room) => <article key={room.id} className="grid gap-5 px-5 py-6 md:grid-cols-[1.2fr_0.65fr_0.8fr_0.8fr_1fr_1fr] md:items-center md:px-6"><div><Link href={`/internal/rooms/${room.id}/edit`} className="font-semibold hover:text-secondary">{room.name}</Link><p className="mt-1 text-xs text-muted">{room.type_label}</p></div>{[["Booking", room.bookings], ["Malam terisi", room.occupied_nights], ["Okupansi", `${room.occupancy_rate}%`], ["Nilai booking", currency(room.booking_value)], ["Pendapatan", currency(room.revenue)]].map(([label, value]) => <div key={label as string}><p className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase md:hidden">{label}</p><p className="mt-1 text-sm font-semibold tabular-nums md:mt-0">{value}</p></div>)}</article>)}</div>
        </div>
      </section>

      <section className="rounded-lg bg-primary p-6 text-white shadow-[0_18px_42px_-28px_rgba(17,17,17,0.55)] sm:p-8"><div className="border-b border-white/20 pb-5"><h2 className="text-2xl font-semibold">Rekap pembayaran</h2><p className="mt-2 text-sm text-white/70">Pembayaran valid berdasarkan metode.</p><p className="mt-5 text-3xl font-semibold tracking-[-0.03em] tabular-nums">{currency(totalPayments)}</p></div><div className="mt-3 divide-y divide-white/15">{data.payment_methods.map((row) => <div key={row.method} className="flex items-center justify-between gap-5 py-4"><div><p className="text-sm font-semibold">{row.label}</p><p className="mt-1 text-xs text-white/65">{row.count} transaksi</p></div><p className="text-sm font-semibold tabular-nums">{currency(row.amount)}</p></div>)}</div></section>
    </div>

    <section className="mt-12"><div><h2 className="text-2xl font-semibold tracking-[-0.02em]">Transaksi periode ini</h2><p className="mt-2 text-sm text-muted">{data.transactions.length} catatan pembayaran dibuat pada rentang terpilih.</p></div>
      {data.transactions.length ? <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><div className="hidden grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.8fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid"><span>Pembayaran</span><span>Booking / tamu</span><span>Kamar</span><span>Metode</span><span>Jumlah</span><span>Aksi</span></div><div className="divide-y">{data.transactions.map((row) => <article key={row.id} className="grid gap-5 px-5 py-6 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.8fr_auto] lg:items-center lg:px-6"><div><p className="font-semibold">{row.payment_code}</p><p className="mt-2 text-xs text-muted">{date(row.paid_at ?? row.created_at)}</p><div className="mt-3"><Status status={row.status} label={row.status_label} /></div></div><div><p className="font-semibold">{row.guest_name}</p><p className="mt-1 text-sm text-muted">{row.booking_code}</p></div><div><p className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase lg:hidden">Kamar</p><p className="mt-1 text-sm lg:mt-0">{row.room_name}</p></div><div><p className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase lg:hidden">Metode</p><p className="mt-1 text-sm lg:mt-0">{row.method_label}</p></div><div><p className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase lg:hidden">Jumlah</p><p className="mt-1 font-semibold tabular-nums lg:mt-0">{currency(row.amount)}</p></div><Link href={`/internal/payments/${row.id}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">Lihat detail</Link></article>)}</div></div> : <div className="mt-5 rounded-lg bg-surface py-16 text-center shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><h3 className="text-lg font-semibold">Belum ada transaksi</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Pilih periode lain atau catat pembayaran baru untuk mengisi laporan ini.</p></div>}
    </section>
  </main>;
}
