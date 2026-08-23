"use client";

export default function AuditLogsError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-[900px] px-6 py-20 text-center"><h1 className="text-3xl font-semibold tracking-[-0.03em]">Audit Log gagal dimuat</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Periksa koneksi lalu coba muat kembali riwayat aktivitas.</p><button type="button" onClick={reset} className="mt-6 h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white">Coba lagi</button></main>;
}
