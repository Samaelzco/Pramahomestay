import { UserFilters } from "@/components/users/user-filters";
import { UserList } from "@/components/users/user-list";
import { PlusIcon, ShieldIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api/client";
import type { AccessMatrix, ApiItem, PaginatedUsers } from "@/lib/api/types";
import type { Metadata } from "next";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import Link from "next/link";

export const metadata: Metadata = { title: "User & Hak Akses" };
type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const locale = await serverLocale();
  const t = (id: string, en: string) => serverLocalize(locale, id, en);
  const params = await searchParams;
  const query = { search: value(params.search), role: value(params.role), is_active: value(params.is_active), page: value(params.page) };
  const apiParams = new URLSearchParams({ per_page: "15" });
  Object.entries(query).forEach(([key, item]) => { if (item) apiParams.set(key, item); });
  const [users, access] = await Promise.all([
    apiFetch<PaginatedUsers>(`/internal/users?${apiParams.toString()}`),
    apiFetch<ApiItem<AccessMatrix>>("/internal/access/roles"),
  ]);
  const success = value(params.success);

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{t("Kelola user", "Manage users")}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{t("Atur anggota tim, status akses login, dan role yang menentukan ruang kerja mereka.", "Manage team members, login access, and the roles that define their workspace.")}</p></div><div className="flex flex-col gap-3 sm:flex-row"><Link href="/internal/users/access" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-low"><ShieldIcon className="size-4" />{t("Hak akses", "Access control")}</Link><Link href="/internal/users/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]"><PlusIcon className="size-4" />{t("Tambah user", "Add user")}</Link></div></div>
    {success === "created" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">{t("User baru berhasil ditambahkan.", "The new user was added successfully.")}</div>}
    {success === "updated" && <div className="mt-8 rounded-sm bg-[#edf4ef] px-5 py-4 text-sm text-[#28533b]" role="status">{t("Perubahan user berhasil disimpan.", "User changes were saved successfully.")}</div>}
    <UserFilters search={query.search} role={query.role} isActive={query.is_active} roles={access.data.roles} />
    <div className="mt-8 flex items-baseline justify-between"><p className="text-sm font-medium">{t(`${users.meta.total} user ditemukan`, `${users.meta.total} users found`)}</p>{(query.search || query.role || query.is_active) && <Link href="/internal/users" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">{t("Hapus filter", "Clear filters")}</Link>}</div>
    {users.data.length ? <UserList users={users.data} /> : <div className="mt-5 rounded-lg bg-surface py-20 text-center shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><h2 className="text-xl font-semibold">{t("Belum ada user yang sesuai", "No matching users")}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">{t("Ubah filter atau tambahkan anggota tim baru.", "Adjust the filters or add a new team member.")}</p><Link href="/internal/users/new" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">{t("Tambah user", "Add user")}</Link></div>}
    <Pagination meta={users.meta} query={query} resourceName="user" resourceNameEn="users" />
  </main>;
}
