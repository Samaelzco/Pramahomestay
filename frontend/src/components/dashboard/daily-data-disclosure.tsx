"use client";

import { useState } from "react";

type DailyRow = {
  date: string;
  end_date: string;
  revenue: string;
  occupancy_rate: number;
};

const currency = (value: string) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
}).format(Number(value));

const date = (value: string) => new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date(`${value}T00:00:00`));

const granularityLabel = { day: "harian", week: "mingguan", month: "bulanan" } as const;

const period = (row: DailyRow, granularity: keyof typeof granularityLabel) => granularity === "day" || row.date === row.end_date
  ? date(row.date)
  : `${date(row.date)}–${date(row.end_date)}`;

export function DailyDataDisclosure({ rows, granularity }: { rows: DailyRow[]; granularity: keyof typeof granularityLabel }) {
  const [open, setOpen] = useState(false);
  const label = granularityLabel[granularity];

  return <div className="border-t px-6 py-5 sm:px-8">
    <button type="button" aria-expanded={open} aria-controls="dashboard-daily-data" onClick={() => setOpen((value) => !value)} className="inline-flex min-h-11 items-center rounded-sm border border-primary px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white active:bg-[#2f3131]">
      {open ? `Sembunyikan data ${label}` : `Lihat data ${label}`}
    </button>
    {open && <div id="dashboard-daily-data" className="mt-5 max-h-80 overflow-y-auto border-t" role="region" aria-label={`Data pendapatan dan okupansi ${label}`}>
      <dl className="divide-y sm:hidden">{rows.map((row) => <div key={row.date} className="py-4"><dt className="text-sm font-semibold">{period(row, granularity)}</dt><dd className="mt-3 grid grid-cols-2 gap-4"><span><span className="block text-xs text-muted">Pendapatan</span><span className="mt-1 block text-sm font-medium tabular-nums">{currency(row.revenue)}</span></span><span className="text-right"><span className="block text-xs text-muted">Okupansi</span><span className="mt-1 block text-sm font-medium tabular-nums">{row.occupancy_rate}%</span></span></dd></div>)}</dl>
      <table className="hidden w-full sm:table">
        <thead className="sticky top-0 bg-surface-low text-left text-xs text-muted"><tr><th className="px-4 py-3 font-medium">{granularity === "day" ? "Tanggal" : "Periode"}</th><th className="px-4 py-3 text-right font-medium">Pendapatan</th><th className="px-4 py-3 text-right font-medium">Okupansi</th></tr></thead>
        <tbody className="divide-y">{rows.map((row) => <tr key={row.date}><td className="px-4 py-3 text-sm">{period(row, granularity)}</td><td className="px-4 py-3 text-right text-sm font-medium tabular-nums">{currency(row.revenue)}</td><td className="px-4 py-3 text-right text-sm font-medium tabular-nums">{row.occupancy_rate}%</td></tr>)}</tbody>
      </table>
    </div>}
  </div>;
}
