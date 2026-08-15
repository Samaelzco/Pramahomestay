"use client";

export default function RoomsError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-[1200px] px-6 py-20 text-center"><h1 className="text-3xl font-semibold tracking-[-0.02em]">Data kamar belum dapat dimuat</h1><p className="mx-auto mt-4 max-w-md leading-7 text-muted">Pastikan layanan backend aktif, lalu coba memuat ulang halaman.</p><button onClick={reset} className="mt-7 h-11 rounded-sm bg-primary px-6 text-sm font-semibold text-white">Coba lagi</button></main>;
}
