import { RoleList } from "@/components/users/role-list";
import { ArrowLeftIcon, PlusIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { AccessMatrix, ApiItem } from "@/lib/api/types";
import type { Metadata } from "next";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import Link from "next/link";

export const metadata: Metadata = { title: "Hak Akses" };

type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function AccessPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const params = await searchParams;
  const response = await apiFetch<ApiItem<AccessMatrix>>("/internal/access/roles");
  const success = value(params.success);

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/users" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />{t("Kembali ke user", "Back to users")}</Link><div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-semibold tracking-[-0.03em] md:text-5xl">{t("Hak akses", "Access control")}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{t("Kelola role dan tentukan pekerjaan operasional yang tersedia untuk setiap anggota tim.", "Manage roles and define the operational work available to each team member.")}</p></div><Link href="/internal/users/access/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]"><PlusIcon className="size-4" />{t("Tambah role", "Add role")}</Link></div>{success === "created" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">{t("Role baru berhasil ditambahkan.", "The role was added successfully.")}</div>}{success === "updated" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">{t("Perubahan role berhasil disimpan.", "Role changes were saved successfully.")}</div>}<div className="mt-10 flex items-baseline justify-between border-t pt-8"><p className="text-sm font-medium">{t(`${response.data.roles.length} role tersedia`, `${response.data.roles.length} roles available`)}</p><p className="text-xs text-muted">{t("Administrator dilindungi oleh sistem", "Administrator is protected by the system")}</p></div><RoleList roles={response.data.roles} /></main>;
}
