import { UserForm } from "@/components/users/user-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { AccessMatrix, ApiItem, InternalUser } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Edit User" };

export default async function EditUserPage({ params }: PageProps<"/internal/users/[id]/edit">) {
  const { id } = await params;
  const [response, access] = await Promise.all([
    apiFetch<ApiItem<InternalUser>>(`/internal/users/${id}`),
    apiFetch<ApiItem<AccessMatrix>>("/internal/access/roles"),
  ]);
  const user = response.data;

  return <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"><Link href="/internal/users" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke user</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">Edit user</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted">Perbarui identitas, role, atau password untuk {user.name}.</p><UserForm user={user} roles={access.data.roles} /></main>;
}
