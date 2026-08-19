"use client";

export default function UsersError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-6 py-16 sm:px-8 md:px-10 xl:px-16"><div className="max-w-2xl border-t pt-10"><h1 className="text-3xl font-semibold tracking-[-0.02em]">Data user belum dapat dimuat</h1><p className="mt-4 text-base leading-7 text-muted">Periksa koneksi ke server, lalu coba muat kembali halaman ini.</p><button type="button" onClick={reset} className="mt-7 h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white">Coba lagi</button></div></main>;
}
