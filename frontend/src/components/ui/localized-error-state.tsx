"use client";

import { localize, useLocale } from "@/lib/locale";

export function LocalizedErrorState({ reset, title, titleEn, description, descriptionEn }: { reset: () => void; title: string; titleEn: string; description: string; descriptionEn: string }) {
  const locale = useLocale();
  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-6 py-16 sm:px-8 md:px-10 xl:px-16"><div className="border-y bg-surface py-20 text-center"><h1 className="text-3xl font-semibold tracking-[-0.03em]">{localize(locale, title, titleEn)}</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">{localize(locale, description, descriptionEn)}</p><button type="button" onClick={reset} className="mt-7 h-11 rounded-sm bg-primary px-6 text-sm font-semibold text-white">{localize(locale, "Coba lagi", "Try again")}</button></div></main>;
}
