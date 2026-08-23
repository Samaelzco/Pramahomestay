"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { revalidatePath } from "next/cache";

export async function updateSettingsAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size === 0) formData.delete("logo");
  formData.set("remove_logo", formData.get("remove_logo") === "1" ? "1" : "0");
  formData.set("_method", "PUT");

  try {
    const response = await apiFetch<{ message?: string }>("/internal/settings", { method: "POST", body: formData });
    revalidatePath("/internal/settings");
    return { success: true, message: response.message ?? "Pengaturan homestay berhasil disimpan." };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Pengaturan belum dapat disimpan. Periksa koneksi lalu coba lagi." };
  }
}
