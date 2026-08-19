import { RoleForm } from "@/components/users/role-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { AccessMatrix, AccessRole, ApiItem } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Edit Role" };

export default async function EditRolePage({ params }: PageProps<"/internal/users/access/[role]/edit">) {
  const { role: roleName } = await params;
  const [matrixResponse, roleResponse] = await Promise.all([
    apiFetch<ApiItem<AccessMatrix>>("/internal/access/roles"),
    apiFetch<ApiItem<AccessRole>>(`/internal/access/roles/${roleName}`),
  ]);

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/users/access" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke hak akses</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">Edit role</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Perbarui tanggung jawab dan permission untuk {roleResponse.data.label}.</p><RoleForm matrix={matrixResponse.data} role={roleResponse.data} /></main>;
}
