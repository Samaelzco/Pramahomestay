import { Sidebar } from "@/components/internal/sidebar";
import { InternalHeader } from "@/components/internal/internal-header";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, InternalNotificationSummary, InternalUser } from "@/lib/api/types";

export default async function InternalLayout({ children }: LayoutProps<"/internal">) {
  const [userResponse, notificationResponse] = await Promise.all([
    apiFetch<ApiItem<InternalUser>>("/user"),
    apiFetch<ApiItem<InternalNotificationSummary>>("/internal/notifications/summary").catch(() => ({
      data: { unread_count: 0, notifications: [], timezone: "Asia/Makassar" },
    })),
  ]);
  const user = userResponse.data;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userName={user.name} permissions={user.permissions} />
      <InternalHeader userId={user.id} userName={user.name} permissions={user.permissions} notificationSummary={notificationResponse.data} />
      <div className="xl:ml-[264px]">{children}</div>
    </div>
  );
}
