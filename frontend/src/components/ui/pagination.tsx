"use client";

import type { PaginationMeta } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";
import Link from "next/link";

type PageItem = number | "ellipsis";

function pageItems(current: number, last: number): PageItem[] {
  const pages = [...new Set([1, last, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= last)
    .sort((a, b) => a - b);
  const items: PageItem[] = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push("ellipsis");
    items.push(page);
  });
  return items;
}

export function Pagination({ meta, query, resourceName, resourceNameEn }: { meta: PaginationMeta; query: Record<string, string | undefined>; resourceName: string; resourceNameEn?: string }) {
  const locale = useLocale();
  if (meta.total === 0) return null;
  const href = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => { if (value) params.set(key, value); });
    params.set("page", String(page));
    return `?${params.toString()}`;
  };
  const hiddenQuery = Object.entries(query).filter(([key, value]) => value && key !== "page" && key !== "per_page");
  const previousDisabled = meta.current_page === 1;
  const nextDisabled = meta.current_page === meta.last_page;
  const selectId = `per-page-${resourceName.replace(/\s+/g, "-")}`;
  const linkClass = "inline-flex size-10 items-center justify-center rounded-sm text-sm font-semibold tabular-nums transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-35";
  const inactiveClass = "border bg-surface hover:bg-surface-low";

  return <nav aria-label={localize(locale, `Paginasi ${resourceName}`, `${resourceNameEn ?? resourceName} pagination`)} className="mt-10 border-t pt-6">
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <p className="text-sm text-muted tabular-nums">{localize(locale, `Menampilkan ${meta.from}–${meta.to} dari ${meta.total} ${resourceName}`, `Showing ${meta.from}–${meta.to} of ${meta.total} ${resourceNameEn ?? resourceName}`)}</p>
      <div className="flex items-center justify-between gap-2 lg:justify-center">
        <Link aria-label={localize(locale, "Halaman sebelumnya", "Previous page")} aria-disabled={previousDisabled} tabIndex={previousDisabled ? -1 : undefined} href={href(Math.max(1, meta.current_page - 1))} className={`${linkClass} ${inactiveClass} w-auto px-3 sm:px-4`}>{localize(locale, "Sebelumnya", "Previous")}</Link>
        <span className="px-2 text-sm font-semibold tabular-nums sm:hidden">{meta.current_page} / {meta.last_page}</span>
        <div className="hidden items-center gap-2 sm:flex">{pageItems(meta.current_page, meta.last_page).map((item, index) => item === "ellipsis" ? <span key={`ellipsis-${index}`} aria-hidden="true" className="grid size-10 place-items-center text-sm text-muted">…</span> : <Link key={item} href={href(item)} aria-current={item === meta.current_page ? "page" : undefined} aria-label={localize(locale, `Halaman ${item}`, `Page ${item}`)} className={`${linkClass} ${item === meta.current_page ? "border border-primary bg-primary text-[#ffffff] hover:opacity-90" : inactiveClass}`}>{item}</Link>)}</div>
        <Link aria-label={localize(locale, "Halaman berikutnya", "Next page")} aria-disabled={nextDisabled} tabIndex={nextDisabled ? -1 : undefined} href={href(Math.min(meta.last_page, meta.current_page + 1))} className={`${linkClass} ${inactiveClass} w-auto px-3 sm:px-4`}>{localize(locale, "Berikutnya", "Next")}</Link>
      </div>
      <form method="get" className="flex items-center gap-3 lg:justify-self-end">
        {hiddenQuery.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
        <label htmlFor={selectId} className="text-sm text-muted">{localize(locale, "Baris per halaman", "Rows per page")}</label>
        <select id={selectId} name="per_page" defaultValue={String(meta.per_page)} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-10 rounded-sm border bg-surface px-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
          {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </form>
    </div>
  </nav>;
}
