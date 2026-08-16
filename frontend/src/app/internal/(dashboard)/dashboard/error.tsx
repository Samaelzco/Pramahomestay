"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-16 sm:px-8 md:px-10 xl:px-16"><div className="border-y bg-surface py-20 text-center"><h1 className="text-2xl font-semibold">Ringkasan belum dapat dimuat</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Periksa koneksi layanan lalu coba kembali. Data operasional Anda tidak berubah.</p><button type="button" onClick={reset} className="mt-6 h-11 rounded-sm bg-primary px-5 text-sm font-semibold text-white">Coba lagi</button></div></main>;
}
