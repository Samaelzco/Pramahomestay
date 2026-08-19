import { Sidebar } from "@/components/internal/sidebar";
import { InternalHeader } from "@/components/internal/internal-header";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, InternalUser } from "@/lib/api/types";

export default async function InternalLayout({ children }: LayoutProps<"/internal">) {
  const response = await apiFetch<ApiItem<InternalUser>>("/user");
  const user = response.data;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userName={user.name} permissions={user.permissions} />
      <InternalHeader userName={user.name} permissions={user.permissions} />
      <div className="xl:ml-[264px]">{children}</div>
    </div>
  );
}
