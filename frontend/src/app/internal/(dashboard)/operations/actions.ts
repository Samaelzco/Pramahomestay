"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { revalidatePath } from "next/cache";

async function bookingOperation(id: number, operation: "check-in" | "check-out", formData: FormData): Promise<ActionState> {
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/operations/bookings/${id}/${operation}`, {
      method: "PATCH",
      body: JSON.stringify({ note: formData.get("reason") || null }),
    });
    ["/internal/operations", "/internal/dashboard", "/internal/bookings", `/internal/bookings/${id}`, "/internal/rooms", "/internal/availability"].forEach((path) => revalidatePath(path));
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Aksi operasional belum dapat diproses. Periksa koneksi lalu coba lagi." };
  }
}

export async function checkInAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  void _state;
  return bookingOperation(id, "check-in", formData);
}

export async function checkOutAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  void _state;
  return bookingOperation(id, "check-out", formData);
}

export async function markRoomReadyAction(id: number, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/operations/rooms/${id}/ready`, { method: "PATCH", body: JSON.stringify({}) });
    ["/internal/operations", "/internal/dashboard", "/internal/rooms", "/internal/availability", "/"].forEach((path) => revalidatePath(path));
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Status kamar belum dapat diperbarui. Periksa koneksi lalu coba lagi." };
  }
}
