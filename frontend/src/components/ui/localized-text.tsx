"use client";

import { localize, useLocale } from "@/lib/locale";

export function LocalizedText({ id, en }: { id: string; en: string }) {
  return localize(useLocale(), id, en);
}
