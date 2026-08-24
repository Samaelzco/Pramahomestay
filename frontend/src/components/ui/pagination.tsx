"use client";

import type { PaginationMeta } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";
import Link from "next/link";

export function Pagination({ meta, query, resourceName, resourceNameEn }: { meta: PaginationMeta; query: Record<string, string | undefined>; resourceName: string; resourceNameEn?: string }) {
  const locale = useLocale();
  if (meta.last_page <= 1) return null;
  const href = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => { if (value) params.set(key, value); });
    params.set("page", String(page));
    return `?${params.toString()}`;
  };
  return <nav aria-label={localize(locale, `Paginasi ${resourceName}`, `${resourceNameEn ?? resourceName} pagination`)} className="mt-10 flex items-center justify-between border-t pt-6"><p className="text-sm text-muted">{localize(locale, `Halaman ${meta.current_page} dari ${meta.last_page}`, `Page ${meta.current_page} of ${meta.last_page}`)}</p><div className="flex gap-2"><Link aria-disabled={meta.current_page === 1} tabIndex={meta.current_page === 1 ? -1 : undefined} href={href(Math.max(1, meta.current_page - 1))} className="rounded-sm border bg-surface px-4 py-2 text-sm font-medium aria-disabled:pointer-events-none aria-disabled:opacity-40">{localize(locale, "Sebelumnya", "Previous")}</Link><Link aria-disabled={meta.current_page === meta.last_page} tabIndex={meta.current_page === meta.last_page ? -1 : undefined} href={href(Math.min(meta.last_page, meta.current_page + 1))} className="rounded-sm border bg-surface px-4 py-2 text-sm font-medium aria-disabled:pointer-events-none aria-disabled:opacity-40">{localize(locale, "Berikutnya", "Next")}</Link></div></nav>;
}
