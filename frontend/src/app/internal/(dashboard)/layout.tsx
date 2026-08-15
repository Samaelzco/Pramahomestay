import { Sidebar } from "@/components/internal/sidebar";
import { InternalHeader } from "@/components/internal/internal-header";
import { apiFetch } from "@/lib/api/client";

type User = { name: string; email: string };

export default async function InternalLayout({ children }: LayoutProps<"/internal">) {
  const user = await apiFetch<User>("/user");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userName={user.name} />
      <InternalHeader userName={user.name} />
      <div className="md:ml-[264px]">{children}</div>
    </div>
  );
}
