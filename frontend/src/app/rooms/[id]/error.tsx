"use client";

import { localize, useLocale } from "@/lib/locale";

export default function RoomDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = useLocale();
  return <main className="grid min-h-screen place-items-center bg-background px-5 text-center text-foreground"><div className="max-w-lg"><h1 className="text-4xl font-semibold tracking-[-0.03em]">{localize(locale, "Detail kamar belum dapat dimuat", "Room details could not be loaded")}</h1><p className="mt-4 leading-7 text-muted">{localize(locale, "Periksa koneksi layanan lalu coba lagi. Pilihan tanggalmu tidak berubah.", "Check the service connection and try again. Your date selection has not changed.")}</p><button type="button" onClick={reset} className="mt-8 min-h-12 bg-primary px-6 text-sm font-bold text-background">{localize(locale, "Coba lagi", "Try again")}</button></div></main>;
}
