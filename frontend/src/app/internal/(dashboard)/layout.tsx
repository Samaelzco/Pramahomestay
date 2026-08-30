import { Sidebar } from "@/components/internal/sidebar";
import { InternalHeader } from "@/components/internal/internal-header";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, InternalNotificationSummary, InternalUser, PublicBrandingData } from "@/lib/api/types";

export default async function InternalLayout({ children }: LayoutProps<"/internal">) {
  const [userResponse, notificationResponse, brandingResponse] = await Promise.all([
    apiFetch<ApiItem<InternalUser>>("/user"),
    apiFetch<ApiItem<InternalNotificationSummary>>("/internal/notifications/summary").catch(() => ({
      data: { unread_count: 0, notifications: [], timezone: "Asia/Makassar" },
    })),
    apiFetch<ApiItem<PublicBrandingData>>("/public/branding", {}, false).catch(() => ({
      data: { name: "Prama Homestay", logo_url: null },
    })),
  ]);
  const user = userResponse.data;
  const branding = brandingResponse.data;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userName={user.name} permissions={user.permissions} propertyName={branding.name} logoUrl={branding.logo_url} />
      <InternalHeader userId={user.id} userName={user.name} permissions={user.permissions} notificationSummary={notificationResponse.data} propertyName={branding.name} logoUrl={branding.logo_url} />
      <div className="xl:ml-[264px]">{children}</div>
    </div>
  );
}
