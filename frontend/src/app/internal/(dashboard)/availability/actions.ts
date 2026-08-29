"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createRoomBlockAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await apiFetch("/internal/availability/blocks", {
      method: "POST",
      body: JSON.stringify({
        room_id: Number(formData.get("room_id")),
        title: formData.get("title"),
        start_date: formData.get("start_date"),
        end_date: formData.get("end_date"),
        notes: formData.get("notes") || null,
      }),
    });
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Blok kamar belum dapat disimpan. Periksa koneksi lalu coba lagi." };
  }
  revalidatePath("/internal/availability");
  revalidatePath("/");
  redirect("/internal/availability?success=blocked");
}

export async function deleteRoomBlockAction(id: number, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/availability/blocks/${id}`, { method: "DELETE" });
    revalidatePath("/internal/availability");
    revalidatePath("/");
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Blok kamar belum dapat dihapus. Periksa koneksi lalu coba lagi." };
  }
}
