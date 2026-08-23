import { AuditLogFilters } from "@/components/audit-logs/audit-log-filters";
import { AuditLogList } from "@/components/audit-logs/audit-log-list";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedAuditLogs } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Audit Log" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = {
    search: value(params.search), module: value(params.module), action: value(params.action),
    actor_id: value(params.actor_id), date_from: value(params.date_from), date_to: value(params.date_to),
    page: value(params.page),
  };
  const apiParams = new URLSearchParams({ per_page: "20" });
  Object.entries(query).forEach(([key, item]) => { if (item) apiParams.set(key, item); });
  const logs = await apiFetch<PaginatedAuditLogs>(`/internal/audit-logs?${apiParams.toString()}`);
  const hasFilters = Object.entries(query).some(([key, item]) => key !== "page" && item);

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">Audit Log</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Telusuri perubahan data dan aktivitas user internal secara kronologis.</p></div>
    <AuditLogFilters search={query.search} module={query.module} action={query.action} actorId={query.actor_id} dateFrom={query.date_from} dateTo={query.date_to} actors={logs.filter_options.actors} />
    <div className="mt-8 flex items-baseline justify-between gap-4"><p className="text-sm font-medium">{logs.meta.total} aktivitas ditemukan</p>{hasFilters && <Link href="/internal/audit-logs" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">Hapus filter</Link>}</div>
    {logs.data.length ? <AuditLogList logs={logs.data} /> : <div className="mt-5 rounded-lg bg-surface py-20 text-center shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><h2 className="text-xl font-semibold">Belum ada aktivitas yang sesuai</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Ubah filter untuk melihat riwayat lain. Aktivitas baru akan tercatat otomatis saat data dikelola.</p></div>}
    <Pagination meta={logs.meta} query={query} resourceName="audit log" />
  </main>;
}
