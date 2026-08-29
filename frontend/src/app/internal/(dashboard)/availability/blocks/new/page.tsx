import { RoomBlockForm } from "@/components/availability/room-block-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { PaginatedRooms } from "@/lib/api/types";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Blokir Kamar" };
type SearchParams = Record<string, string | string[] | undefined>;

export default async function NewRoomBlockPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const params = await searchParams;
  const requestedStart = typeof params.start === "string" ? params.start : "";
  const initialStart = /^\d{4}-\d{2}-\d{2}$/.test(requestedStart) ? requestedStart : new Date().toISOString().slice(0, 10);
  const rooms = await apiFetch<PaginatedRooms>("/internal/rooms?per_page=50");
  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/availability" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />{t("Kembali ke kalender", "Back to calendar")}</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{t("Blokir kamar", "Block a room")}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{t("Tandai kamar yang tidak dapat dijual tanpa membuat booking fiktif.", "Mark a room as unavailable without creating a fake booking.")}</p><RoomBlockForm rooms={rooms.data} initialStart={initialStart} /></main>;
}
