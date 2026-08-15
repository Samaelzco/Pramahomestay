import { Sidebar } from "@/components/internal/sidebar";
import { BedIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import Link from "next/link";

type User = { name: string; email: string };

export default async function InternalLayout({ children }: LayoutProps<"/internal">) {
  const user = await apiFetch<User>("/user");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userName={user.name} />
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-surface/95 px-6 md:ml-[264px] md:px-10">
        <Link href="/internal/rooms" className="flex items-center gap-2.5 md:hidden"><span className="grid size-9 place-items-center rounded-md bg-primary text-white"><BedIcon className="size-4" /></span><span className="font-semibold">Prama</span></Link>
        <p className="hidden text-sm font-medium md:block">Inventori kamar</p>
        <div className="text-right"><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-muted">Admin internal</p></div>
      </header>
      <div className="md:ml-[264px]">{children}</div>
    </div>
  );
}
