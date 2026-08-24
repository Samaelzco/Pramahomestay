import { SettingsForm } from "@/components/settings/settings-form";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, HomestaySettings } from "@/lib/api/types";
import type { Metadata } from "next";
import { LocalizedText } from "@/components/ui/localized-text";

export const metadata: Metadata = { title: "Pengaturan Homestay" };

export default async function SettingsPage() {
  const { data: settings } = await apiFetch<ApiItem<HomestaySettings>>("/internal/settings");

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl"><LocalizedText id="Pengaturan homestay" en="Homestay settings" /></h1>
    <p className="mt-3 max-w-2xl text-base leading-7 text-muted"><LocalizedText id="Kelola identitas properti, waktu operasional, tujuan pembayaran, dan aturan reservasi dari satu tempat." en="Manage property identity, operating hours, payment destinations, and reservation rules in one place." /></p>
    <SettingsForm settings={settings} />
  </main>;
}
