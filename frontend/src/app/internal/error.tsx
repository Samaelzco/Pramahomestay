"use client";

import { LocalizedErrorState } from "@/components/ui/localized-error-state";
import { useEffect } from "react";

export default function InternalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <LocalizedErrorState
    reset={reset}
    title="Area internal belum dapat dimuat"
    titleEn="The internal area could not be loaded"
    description="Layanan tidak merespons tepat waktu. Coba lagi; jika masih gagal, periksa status backend."
    descriptionEn="The service did not respond in time. Try again; if it still fails, check the backend status."
  />;
}
