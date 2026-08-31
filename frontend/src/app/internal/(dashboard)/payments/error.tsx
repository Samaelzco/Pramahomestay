"use client";
import { LocalizedErrorState } from "@/components/ui/localized-error-state";
export default function PaymentsError({ reset }: { reset: () => void }) { return <LocalizedErrorState reset={reset} title="Data pembayaran belum dapat dimuat" titleEn="Payments could not be loaded" description="Periksa koneksi ke server, lalu coba lagi." descriptionEn="Check the server connection, then try again." />; }
