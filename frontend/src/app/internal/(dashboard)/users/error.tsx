"use client";
import { LocalizedErrorState } from "@/components/ui/localized-error-state";
export default function UsersError({ reset }: { reset: () => void }) { return <LocalizedErrorState reset={reset} title="Data user belum dapat dimuat" titleEn="Users could not be loaded" description="Periksa koneksi ke server, lalu coba muat kembali halaman ini." descriptionEn="Check the server connection, then try loading this page again." />; }
