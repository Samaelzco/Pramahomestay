"use client";
import { LocalizedErrorState } from "@/components/ui/localized-error-state";
export default function BookingsError({ reset }: { reset: () => void }) { return <LocalizedErrorState reset={reset} title="Data booking belum dapat dimuat" titleEn="Bookings could not be loaded" description="Periksa koneksi ke server, lalu coba lagi." descriptionEn="Check the server connection, then try again." />; }
