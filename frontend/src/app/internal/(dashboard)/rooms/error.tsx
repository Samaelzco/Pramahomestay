"use client";
import { LocalizedErrorState } from "@/components/ui/localized-error-state";
export default function RoomsError({ reset }: { reset: () => void }) { return <LocalizedErrorState reset={reset} title="Data kamar belum dapat dimuat" titleEn="Rooms could not be loaded" description="Pastikan layanan backend aktif, lalu coba memuat ulang halaman." descriptionEn="Make sure the backend service is running, then reload the page." />; }
