"use client";
import { LocalizedErrorState } from "@/components/ui/localized-error-state";
export default function AuditLogsError({ reset }: { reset: () => void }) { return <LocalizedErrorState reset={reset} title="Audit Log gagal dimuat" titleEn="Audit Log could not be loaded" description="Periksa koneksi lalu coba muat kembali riwayat aktivitas." descriptionEn="Check the connection and try loading the activity history again." />; }
