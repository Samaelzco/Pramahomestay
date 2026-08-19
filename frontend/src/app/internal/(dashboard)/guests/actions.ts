"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const payload = (formData: FormData) => ({ full_name: formData.get("full_name"), email: formData.get("email"), phone: formData.get("phone"), address: formData.get("address") || null, notes: formData.get("notes") || null });

async function save(path: string, method: "POST" | "PUT", formData: FormData): Promise<ActionState | null> {
  try { await apiFetch(path, { method, body: JSON.stringify(payload(formData)) }); return null; }
  catch (error) { if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors }; return { message: "Data tamu belum dapat disimpan. Periksa koneksi lalu coba lagi." }; }
}

export async function createGuestAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save("/internal/guests", "POST", formData); if (error) return error;
  revalidatePath("/internal/guests"); redirect("/internal/guests?success=created");
}

export async function updateGuestAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save(`/internal/guests/${id}`, "PUT", formData); if (error) return error;
  revalidatePath("/internal/guests"); revalidatePath(`/internal/guests/${id}`); redirect(`/internal/guests/${id}?success=updated`);
}

export async function setGuestActivationAction(id: number, isActive: boolean, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/guests/${id}/activation`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) });
    revalidatePath("/internal/guests");
    revalidatePath(`/internal/guests/${id}`);
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Status tamu belum dapat diubah. Periksa koneksi lalu coba lagi." };
  }
}

export async function deleteGuestAction(id: number, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/guests/${id}`, { method: "DELETE" });
    revalidatePath("/internal/guests");
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Profil tamu belum dapat dihapus. Periksa koneksi lalu coba lagi." };
  }
}
