"use server";

import { apiFetch } from "@/lib/api/client";
import type { ApiItem, InternalNotification, InternalNotificationSummary } from "@/lib/api/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getInternalNotificationSummaryAction(): Promise<InternalNotificationSummary> {
  const response = await apiFetch<ApiItem<InternalNotificationSummary>>("/internal/notifications/summary");
  return response.data;
}

export async function markAllInternalNotificationsReadAction(): Promise<void> {
  await apiFetch("/internal/notifications/read-all", { method: "POST" });
  revalidatePath("/internal", "layout");
}

export async function openInternalNotificationAction(id: number): Promise<void> {
  const response = await apiFetch<ApiItem<InternalNotification>>(`/internal/notifications/${id}/read`, { method: "POST" });
  revalidatePath("/internal", "layout");
  const destination = response.data.action_url.startsWith("/internal/") ? response.data.action_url : "/internal/notifications";
  redirect(destination);
}
