"use client";
import { LocalizedErrorState } from "@/components/ui/localized-error-state";
export default function SettingsError({ reset }: { reset: () => void }) { return <LocalizedErrorState reset={reset} title="Pengaturan gagal dimuat" titleEn="Settings could not be loaded" description="Periksa koneksi lalu coba muat kembali pengaturan homestay." descriptionEn="Check the connection and try loading the homestay settings again." />; }
