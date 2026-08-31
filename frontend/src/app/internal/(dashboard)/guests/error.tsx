"use client";
import { LocalizedErrorState } from "@/components/ui/localized-error-state";
export default function GuestsError({ reset }: { reset: () => void }) { return <LocalizedErrorState reset={reset} title="Data tamu belum dapat dimuat" titleEn="Guests could not be loaded" description="Periksa koneksi layanan lalu coba kembali. Data yang tersimpan tidak berubah." descriptionEn="Check the service connection and try again. Your saved data has not changed." />; }
