"use client";

export default function BookingError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-[1000px] px-6 py-20 text-center"><h1 className="text-3xl font-semibold tracking-[-0.03em]">Data booking belum dapat dimuat</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">Periksa koneksi ke server, lalu coba lagi.</p><button onClick={reset} className="mt-7 h-11 rounded-sm bg-primary px-6 text-sm font-semibold text-white">Coba lagi</button></main>;
}
