"use client";

import Link from "next/link";
import Form from "next/form";
import { FormEvent, useEffect, useId, useRef, useState } from "react";

const periods = [7, 30, 90] as const;

export function PeriodFilter({ activeDays, custom, initialFrom, initialTo }: {
  activeDays: 7 | 30 | 90 | null;
  custom: boolean;
  initialFrom: string;
  initialTo: string;
}) {
  const panelId = useId();
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const controlClass = (active: boolean) => `grid min-h-11 min-w-0 place-items-center rounded-sm px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${active ? "bg-primary text-white shadow-[0_8px_20px_-14px_rgba(17,17,17,.6)]" : "text-muted hover:bg-surface hover:text-primary"}`;

  function submit(event: FormEvent<HTMLFormElement>) {
    if (from > to) {
      event.preventDefault();
      setError("Tanggal akhir harus sama atau setelah tanggal awal.");
    }
  }

  return <div ref={containerRef} className="relative w-full xl:w-auto" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
    <nav aria-label="Periode analitik" className="grid w-full grid-cols-4 rounded-sm bg-surface-low p-1 xl:inline-grid xl:w-auto">
      {periods.map((period) => <Link key={period} href={`/internal/dashboard?days=${period}`} onClick={() => setOpen(false)} aria-current={activeDays === period ? "page" : undefined} className={controlClass(activeDays === period)}>{period} hari</Link>)}
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => { setOpen((value) => !value); setError(""); }} className={controlClass(custom)}>Rentang</button>
    </nav>

    {open && <Form id={panelId} action="/internal/dashboard" onSubmit={submit} className="mt-3 grid gap-4 border-t bg-surface pt-5 sm:absolute sm:right-0 sm:z-20 sm:mt-2 sm:w-[22rem] sm:rounded-lg sm:border-0 sm:p-5 sm:shadow-[0_20px_48px_-22px_rgba(17,17,17,.35)]" aria-label="Pilih rentang tanggal">
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Mulai
          <input name="from" type="date" required value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setError(""); }} aria-describedby={error ? errorId : undefined} className="min-h-11 min-w-0 rounded-sm border bg-surface px-3 text-base font-normal normal-case tracking-normal text-primary outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
        </label>
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Sampai
          <input name="to" type="date" required value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setError(""); }} aria-describedby={error ? errorId : undefined} className="min-h-11 min-w-0 rounded-sm border bg-surface px-3 text-base font-normal normal-case tracking-normal text-primary outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
        </label>
      </div>
      {error && <p id={errorId} role="alert" className="text-sm leading-5 text-red-700">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" className="min-h-11 rounded-sm bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] active:bg-black">Terapkan</button>
      </div>
    </Form>}
  </div>;
}
