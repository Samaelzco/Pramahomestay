import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, AuditLog } from "@/lib/api/types";
import { auditActionLabel, auditDescription, enumValueLabel, fieldLabel, moduleLabel } from "@/lib/display-labels";
import { localeCode, serverLocale, serverLocalize, type ServerLocale } from "@/lib/locale-server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Detail Audit Log" };
function formatValue(field: string, value: unknown, locale: ServerLocale, currency: Intl.NumberFormat): string {
  if (value === null || value === undefined || value === "") return serverLocalize(locale, "Kosong", "Empty");
  if (field === "is_active") return value ? serverLocalize(locale, "Aktif", "Active") : serverLocalize(locale, "Nonaktif", "Inactive");
  if (typeof value === "boolean") return value ? serverLocalize(locale, "Ya", "Yes") : serverLocalize(locale, "Tidak", "No");
  if (["price_per_night", "total_amount", "amount_paid"].includes(field) && !Number.isNaN(Number(value))) return currency.format(Number(value));
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : serverLocalize(locale, "Kosong", "Empty");
  if (typeof value === "object") return JSON.stringify(value);
  return enumValueLabel(value, locale) ?? String(value);
}

export default async function AuditLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const code = localeCode(locale);
  const dateTime = new Intl.DateTimeFormat(code, { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const currency = new Intl.NumberFormat(code, { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  const { id } = await params;
  const { data: log } = await apiFetch<ApiItem<AuditLog>>(`/internal/audit-logs/${encodeURIComponent(id)}`);
  const fields = Array.from(new Set([...Object.keys(log.old_values ?? {}), ...Object.keys(log.new_values ?? {})]));

  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <Link href="/internal/audit-logs" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />{t("Kembali ke Audit Log", "Back to Audit Log")}</Link>
    <div className="mt-8"><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{log.subject_label ?? t(`Aktivitas #${log.id}`, `Activity #${log.id}`)}</h1><span className="inline-flex rounded-sm bg-secondary-soft px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#5f411b] uppercase">{auditActionLabel(log.action, log.action_label, locale)}</span></div><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{auditDescription(log.action, log.module, log.subject_label, log.description, locale)}</p></div>
    <dl className="mt-10 grid gap-x-8 gap-y-5 border-y py-7 sm:grid-cols-2 lg:grid-cols-4">
      <div><dt className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">User</dt><dd className="mt-2 text-sm font-semibold">{log.actor?.name ?? t("User terhapus", "Deleted user")}</dd>{log.actor?.email && <dd className="mt-1 text-sm text-muted">{log.actor.email}</dd>}</div>
      <div><dt className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">{t("Modul", "Module")}</dt><dd className="mt-2 text-sm font-semibold">{moduleLabel(log.module, log.module_label, locale)}</dd></div>
      <div><dt className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">{t("Waktu", "Time")}</dt><dd className="mt-2 text-sm font-semibold tabular-nums">{dateTime.format(new Date(log.created_at))}</dd></div>
      <div><dt className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">{t("Alamat IP", "IP address")}</dt><dd className="mt-2 text-sm font-semibold tabular-nums">{log.ip_address ?? t("Tidak tersedia", "Unavailable")}</dd></div>
    </dl>
    <section className="mt-10"><h2 className="text-2xl font-semibold tracking-[-0.02em]">{t("Rincian perubahan", "Change details")}</h2><p className="mt-2 text-sm leading-6 text-muted">{t("Nilai sebelum dan sesudah aktivitas disimpan sebagai catatan read-only.", "Values before and after the activity are stored as a read-only record.")}</p>
      {fields.length ? <div className="mt-6 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><div className="hidden grid-cols-[200px_1fr_1fr] gap-6 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase sm:grid"><span>Field</span><span>{t("Sebelum", "Before")}</span><span>{t("Sesudah", "After")}</span></div><dl className="divide-y">{fields.map((field) => <div key={field} className="grid gap-4 px-5 py-5 sm:grid-cols-[200px_1fr_1fr] sm:gap-6 sm:px-6"><dt className="text-sm font-semibold">{fieldLabel(field, locale)}</dt><dd><span className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase sm:hidden">{t("Sebelum", "Before")}</span><p className="mt-1 break-words text-sm leading-6 text-muted sm:mt-0">{formatValue(field, log.old_values?.[field], locale, currency)}</p></dd><dd><span className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase sm:hidden">{t("Sesudah", "After")}</span><p className="mt-1 break-words text-sm leading-6 font-medium sm:mt-0">{formatValue(field, log.new_values?.[field], locale, currency)}</p></dd></div>)}</dl></div> : <p className="mt-6 rounded-lg bg-surface px-6 py-12 text-center text-sm text-muted shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">{t("Aktivitas ini tidak membawa perubahan field yang dapat ditampilkan.", "This activity has no field changes to display.")}</p>}
    </section>
    <section className="mt-10 border-t pt-7"><h2 className="text-lg font-semibold">{t("Konteks perangkat", "Device context")}</h2><p className="mt-3 max-w-4xl break-words text-sm leading-7 text-muted">{log.user_agent ?? t("Informasi perangkat tidak tersedia.", "Device information is unavailable.")}</p></section>
  </main>;
}
