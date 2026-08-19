import { RoleForm } from "@/components/users/role-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { AccessMatrix, ApiItem } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Tambah Role" };

export default async function NewRolePage() {
  const response = await apiFetch<ApiItem<AccessMatrix>>("/internal/access/roles");
  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/users/access" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke hak akses</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">Tambah role</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Buat ruang kerja baru dengan permission yang sesuai tanggung jawab tim.</p><RoleForm matrix={response.data} /></main>;
}
