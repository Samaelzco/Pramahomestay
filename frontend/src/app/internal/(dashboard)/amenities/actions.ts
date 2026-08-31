"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const payload = (formData: FormData) => ({
  name: formData.get("name"),
  name_en: formData.get("name_en") || null,
  description: formData.get("description") || null,
  description_en: formData.get("description_en") || null,
  is_active: formData.get("is_active") === "1",
});

async function save(path: string, method: "POST" | "PUT", formData: FormData): Promise<ActionState | null> {
  try {
    await apiFetch(path, { method, body: JSON.stringify(payload(formData)) });
    return null;
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Fasilitas belum dapat disimpan. Periksa koneksi lalu coba lagi." };
  }
}

export async function createAmenityAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save("/internal/amenities", "POST", formData);
  if (error) return error;
  revalidatePath("/internal/amenities");
  revalidatePath("/internal/rooms");
  redirect("/internal/amenities?success=created");
}

export async function updateAmenityAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save(`/internal/amenities/${id}`, "PUT", formData);
  if (error) return error;
  revalidatePath("/internal/amenities");
  revalidatePath("/internal/rooms");
  redirect("/internal/amenities?success=updated");
}

export async function setAmenityActivationAction(id: number, isActive: boolean, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/amenities/${id}/activation`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) });
    revalidatePath("/internal/amenities");
    revalidatePath("/internal/rooms");
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Status fasilitas belum dapat diubah. Periksa koneksi lalu coba lagi." };
  }
}

export async function deleteAmenityAction(id: number, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/amenities/${id}`, { method: "DELETE" });
    revalidatePath("/internal/amenities");
    revalidatePath("/internal/rooms");
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Fasilitas belum dapat dihapus. Periksa koneksi lalu coba lagi." };
  }
}
