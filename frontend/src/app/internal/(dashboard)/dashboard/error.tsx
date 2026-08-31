"use client";
import { LocalizedErrorState } from "@/components/ui/localized-error-state";
export default function DashboardError({ reset }: { reset: () => void }) { return <LocalizedErrorState reset={reset} title="Ringkasan belum dapat dimuat" titleEn="Overview could not be loaded" description="Periksa koneksi layanan lalu coba kembali. Data operasional Anda tidak berubah." descriptionEn="Check the service connection and try again. Your operational data has not changed." />; }
