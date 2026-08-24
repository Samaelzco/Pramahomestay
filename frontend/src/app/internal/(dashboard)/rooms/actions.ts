"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function roomPayload(formData: FormData, method: "POST" | "PUT") {
  const images = formData.getAll("images[]");

  formData.set("is_active", formData.get("is_active") === "on" ? "1" : "0");
  formData.delete("images[]");
  images.forEach((image) => {
    if (image instanceof File && image.size > 0) formData.append("images[]", image);
  });
  if (method === "PUT") formData.set("_method", "PUT");

  return formData;
}

async function saveRoom(path: string, method: "POST" | "PUT", formData: FormData): Promise<ActionState | null> {
  try {
    await apiFetch(path, { method: "POST", body: roomPayload(formData, method) });
    return null;
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.payload.message, errors: error.payload.errors };
    }
    return { message: "Kamar belum dapat disimpan. Periksa koneksi lalu coba lagi." };
  }
}

export async function createRoomAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await saveRoom("/internal/rooms", "POST", formData);
  if (error) return error;
  revalidatePath("/internal/rooms");
  redirect("/internal/rooms?success=created");
}

export async function updateRoomAction(roomId: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await saveRoom(`/internal/rooms/${roomId}`, "PUT", formData);
  if (error) return error;
  revalidatePath("/internal/rooms");
  revalidatePath(`/internal/rooms/${roomId}/edit`);
  redirect("/internal/rooms?success=updated");
}

export async function setRoomActivationAction(roomId: number, isActive: boolean, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/rooms/${roomId}/activation`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) });
    revalidatePath("/internal/rooms");
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Status kamar belum dapat diubah. Periksa koneksi lalu coba lagi." };
  }
}

export async function deleteRoomAction(roomId: number, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/rooms/${roomId}`, { method: "DELETE" });
    revalidatePath("/internal/rooms");
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Kamar belum dapat dihapus. Periksa koneksi lalu coba lagi." };
  }
}
