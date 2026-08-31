import { deleteRoomBlockAction } from "@/app/internal/(dashboard)/availability/actions";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { AvailabilityCalendarData, AvailabilityEntry } from "@/lib/api/types";
import type { ServerLocale } from "@/lib/locale-server";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const dayMs = 86_400_000;
const toUtc = (value: string) => new Date(`${value}T00:00:00Z`);
const iso = (date: Date) => date.toISOString().slice(0, 10);

function datesBetween(start: string, days: number): string[] {
  const first = toUtc(start);
  return Array.from({ length: days }, (_, index) => iso(new Date(first.getTime() + (index * dayMs))));
}

function clippedPosition(entry: AvailabilityEntry, periodStart: string, periodEnd: string) {
  const start = Math.max(toUtc(entry.start).getTime(), toUtc(periodStart).getTime());
  const end = Math.min(toUtc(entry.end).getTime(), toUtc(periodEnd).getTime());
  return {
    start: Math.round((start - toUtc(periodStart).getTime()) / dayMs),
    span: Math.max(1, Math.round((end - start) / dayMs)),
  };
}

function entryClass(entry: AvailabilityEntry): string {
  if (entry.type === "block") return "bg-[#ece3d7] text-[#6d4a22] ring-[#8e6634]/20";
  return {
    pending: "bg-[#fff2d9] text-[#765017] ring-[#a66d1c]/20",
    confirmed: "bg-[#e6eef8] text-[#234e7d] ring-[#356da5]/20",
    checked_in: "bg-[#e3f1e8] text-[#285d3d] ring-[#397a53]/20",
    checked_out: "bg-surface-high text-muted ring-primary/10",
    cancelled: "bg-surface-high text-muted ring-primary/10",
    blocked: "bg-[#ece3d7] text-[#6d4a22] ring-[#8e6634]/20",
  }[entry.status];
}

function EntryBar({ entry, periodStart, periodEnd }: { entry: AvailabilityEntry; periodStart: string; periodEnd: string }) {
  const position = clippedPosition(entry, periodStart, periodEnd);
  const content = <><span className="truncate font-semibold">{entry.label}</span>{position.span > 1 && <span className="truncate text-[10px] opacity-75">{entry.code ?? entry.status_label}</span>}</>;
  const style = { gridColumn: `${position.start + 1} / span ${position.span}` };
  const className = `z-[1] mx-1 my-3 flex min-w-0 flex-col justify-center rounded-sm px-3 py-2 text-xs ring-1 ring-inset transition-transform ${entryClass(entry)} ${entry.href ? "hover:-translate-y-0.5" : ""}`;
  return entry.href ? <Link href={entry.href} style={style} className={className} title={`${entry.label} · ${entry.status_label}`}>{content}</Link> : <div style={style} className={className} title={`${entry.label} · ${entry.status_label}`}>{content}</div>;
}

function Metric({ label, value, detail }: { label: string; value: ReactNode; detail: string }) {
  return <div className="min-w-0 py-5 sm:px-5 sm:first:pl-0"><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.02em] tabular-nums">{value}</p><p className="mt-1 text-xs text-muted">{detail}</p></div>;
}

export function AvailabilityCalendar({ data, locale, canManage }: { data: AvailabilityCalendarData; locale: ServerLocale; canManage: boolean }) {
  const t = (id: string, en: string) => locale === "en" ? en : id;
  const localeCode = locale === "en" ? "en-US" : "id-ID";
  const dates = datesBetween(data.period.start, data.period.days);
  const dateFormatter = new Intl.DateTimeFormat(localeCode, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const fullDateFormatter = new Intl.DateTimeFormat(localeCode, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const today = new Date().toISOString().slice(0, 10);
  const allBlocks = data.rooms.flatMap((room) => room.entries.filter((entry) => entry.type === "block").map((entry) => ({ ...entry, roomName: room.name })));
  const gridStyle = { gridTemplateColumns: `repeat(${dates.length}, minmax(${data.period.view === "day" ? 180 : 96}px, 1fr))` } as CSSProperties;

  return <>
    <section className="mt-8 grid grid-cols-2 gap-x-5 border-y sm:grid-cols-4 sm:divide-x">
      <Metric label={t("Okupansi", "Occupancy")} value={`${data.summary.occupancy_rate}%`} detail={t("dari malam yang dapat dijual", "of sellable room nights")} />
      <Metric label={t("Terisi", "Occupied")} value={data.summary.occupied_room_days} detail={t("malam kamar", "room nights")} />
      <Metric label={t("Tersedia", "Available")} value={data.summary.available_room_days} detail={t("malam kamar", "room nights")} />
      <Metric label={t("Diblokir", "Blocked")} value={data.summary.blocked_room_days} detail={t("malam kamar", "room nights")} />
    </section>

    <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label={t("Legenda kalender", "Calendar legend")}>
      {[["bg-[#fff2d9]", t("Menunggu", "Pending")], ["bg-[#e6eef8]", t("Dikonfirmasi", "Confirmed")], ["bg-[#e3f1e8]", t("Check-in", "Checked in")], ["bg-[#ece3d7]", t("Diblokir", "Blocked")]].map(([color, label]) => <span key={label} className="inline-flex items-center gap-2"><span className={`size-2.5 rounded-full ${color}`} />{label}</span>)}
    </div>

    {data.rooms.length === 0 ? <div className="mt-6 border-y bg-surface py-20 text-center"><h2 className="text-xl font-semibold">{t("Belum ada kamar", "No rooms yet")}</h2><p className="mt-3 text-sm text-muted">{t("Tambahkan kamar agar jadwal ketersediaan dapat ditampilkan.", "Add a room to display its availability schedule.")}</p></div> : <>
      <div className="mt-5 hidden overflow-x-auto rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)] md:block">
        <div className="min-w-max">
          <div className="grid grid-cols-[180px_auto] border-b bg-surface-low lg:grid-cols-[220px_auto]">
            <div className="sticky left-0 z-10 flex items-end border-r bg-surface-low px-5 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">{t("Kamar", "Room")}</div>
            <div className="grid" style={gridStyle}>{dates.map((date) => <div key={date} className={`border-r px-2 py-3 text-center ${date === today ? "bg-[#f4eadb]" : ""}`}><p className="text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">{dateFormatter.format(toUtc(date)).split(" ")[0]}</p><p className="mt-1 text-sm font-semibold tabular-nums">{dateFormatter.format(toUtc(date)).replace(/^\S+\s/, "")}</p></div>)}</div>
          </div>
          {data.rooms.map((room) => <div key={room.id} className="grid min-h-20 grid-cols-[180px_auto] border-b last:border-b-0 lg:grid-cols-[220px_auto]">
            <div className="sticky left-0 z-10 flex flex-col justify-center border-r bg-surface px-5 py-3"><p className="font-semibold">{room.name}</p><p className="mt-1 text-xs text-muted">{room.is_active ? t("Aktif", "Active") : t("Nonaktif", "Inactive")}</p></div>
            <div className="relative"><div className="grid h-full min-h-20" style={gridStyle}>{dates.map((date) => <div key={date} className={`border-r ${date === today ? "bg-[#f4eadb]/45" : ""}`} />)}</div><div className="pointer-events-none absolute inset-0 grid" style={gridStyle}>{room.entries.map((entry) => <div key={`${entry.type}-${entry.id}`} className="pointer-events-auto contents"><EntryBar entry={entry} periodStart={data.period.start} periodEnd={data.period.end} /></div>)}</div></div>
          </div>)}
        </div>
      </div>

      <div className="mt-5 space-y-3 md:hidden">{dates.map((date) => {
        const entries = data.rooms.flatMap((room) => room.entries.filter((entry) => entry.start <= date && entry.end > date).map((entry) => ({ ...entry, roomName: room.name, roomIsActive: room.is_active })));
        const unavailableActiveRooms = entries.filter((entry) => entry.roomIsActive).length;
        return <article key={date} className={`rounded-md bg-surface px-4 py-4 shadow-[0_14px_34px_-28px_rgba(17,17,17,.5)] ${date === today ? "ring-1 ring-secondary/40" : ""}`}><div className="flex items-baseline justify-between gap-4"><h3 className="font-semibold capitalize">{fullDateFormatter.format(toUtc(date))}</h3><span className="shrink-0 text-xs text-muted">{Math.max(0, data.summary.active_rooms - unavailableActiveRooms)} {t("tersedia", "available")}</span></div>{entries.length ? <div className="mt-3 space-y-2">{entries.map((entry) => { const content = <div className={`rounded-sm px-3 py-3 text-sm ring-1 ring-inset ${entryClass(entry)}`}><p className="font-semibold">{entry.roomName}</p><p className="mt-1 truncate text-xs">{entry.label} · {entry.status_label}</p></div>; return entry.href ? <Link key={`${entry.type}-${entry.id}`} href={entry.href}>{content}</Link> : <div key={`${entry.type}-${entry.id}`}>{content}</div>; })}</div> : <p className="mt-3 text-sm text-muted">{t("Semua kamar aktif masih tersedia.", "All active rooms are still available.")}</p>}</article>;
      })}</div>
    </>}

    {allBlocks.length > 0 && <section className="mt-12 border-t pt-8"><div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-[-0.02em]">{t("Blok kamar pada periode ini", "Room blocks in this period")}</h2><p className="mt-2 text-sm text-muted">{t("Blok dapat dihapus ketika kamar kembali siap dijual.", "Remove a block when the room is ready to sell again.")}</p></div><span className="text-sm font-semibold tabular-nums text-secondary">{allBlocks.length}</span></div><div className="mt-5 divide-y rounded-lg bg-surface px-5 shadow-[0_18px_42px_-28px_rgba(68,71,72,.25)]">{allBlocks.map((block) => <div key={block.id} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-semibold">{block.roomName} · {block.label}</p><p className="mt-1 text-sm text-muted">{block.start} — {block.end}</p></div>{canManage && <ConfirmAction action={deleteRoomBlockAction.bind(null, block.id)} trigger={t("Hapus blok", "Remove block")} title={t(`Hapus blok ${block.roomName}?`, `Remove the block for ${block.roomName}?`)} description={t("Kamar akan kembali tersedia pada rentang ini selama tidak ada booking lain.", "The room will become available for this period as long as there is no other booking.")} confirmLabel={t("Ya, hapus blok", "Yes, remove block")} />}</div>)}</div></section>}
  </>;
}
