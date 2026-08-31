"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState, GuestReference, PaginatedGuests } from "@/lib/api/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function payload(formData: FormData) {
  return {
    room_id: Number(formData.get("room_id")),
    guest_id: Number(formData.get("guest_id")),
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out"),
    guest_count: Number(formData.get("guest_count")),
    status: formData.get("status"),
    special_requests: formData.get("special_requests") || null,
    internal_notes: formData.get("internal_notes") || null,
  };
}

async function save(path: string, method: "POST" | "PUT", formData: FormData): Promise<ActionState | null> {
  try {
    await apiFetch(path, { method, body: JSON.stringify(payload(formData)) });
    return null;
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Booking belum dapat disimpan. Periksa koneksi lalu coba lagi." };
  }
}

export async function createBookingAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save("/internal/bookings", "POST", formData);
  if (error) return error;
  revalidatePath("/internal/bookings");
  redirect("/internal/bookings?success=created");
}

export async function updateBookingAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save(`/internal/bookings/${id}`, "PUT", formData);
  if (error) return error;
  revalidatePath("/internal/bookings");
  revalidatePath(`/internal/bookings/${id}`);
  redirect(`/internal/bookings/${id}?success=updated`);
}

export async function searchGuestOptionsAction(search: string): Promise<GuestReference[]> {
  const query = search.trim();
  const suffix = query ? `&search=${encodeURIComponent(query)}` : "";

  try {
    const response = await apiFetch<PaginatedGuests>(`/internal/guests?is_active=1&per_page=20${suffix}`);
    return response.data;
  } catch {
    return [];
  }
}

export async function cancelBookingAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/bookings/${id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason: formData.get("reason") || null }) });
    revalidatePath("/internal/bookings");
    revalidatePath(`/internal/bookings/${id}`);
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Booking belum dapat dibatalkan. Periksa koneksi lalu coba lagi." };
  }
}

export async function deleteBookingAction(id: number, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/bookings/${id}`, { method: "DELETE" });
    revalidatePath("/internal/bookings");
    revalidatePath(`/internal/bookings/${id}`);
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Booking belum dapat dihapus. Periksa koneksi lalu coba lagi." };
  }
}
