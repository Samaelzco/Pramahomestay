"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { revalidatePath } from "next/cache";

export async function updateSettingsAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size === 0) formData.delete("logo");
  const heroVideo = formData.get("hero_video");
  if (heroVideo instanceof File && heroVideo.size === 0) formData.delete("hero_video");
  const heroImages = formData.getAll("hero_images[]");
  if (heroImages.every((image) => image instanceof File && image.size === 0)) formData.delete("hero_images[]");
  const finalCtaImage = formData.get("final_cta_image");
  if (finalCtaImage instanceof File && finalCtaImage.size === 0) formData.delete("final_cta_image");
  formData.set("remove_logo", formData.get("remove_logo") === "1" ? "1" : "0");
  formData.set("remove_hero_video", formData.get("remove_hero_video") === "1" ? "1" : "0");
  formData.set("remove_final_cta_image", formData.get("remove_final_cta_image") === "1" ? "1" : "0");
  formData.set("_method", "PUT");

  try {
    const response = await apiFetch<{ message?: string }>("/internal/settings", { method: "POST", body: formData });
    revalidatePath("/internal/settings");
    revalidatePath("/");
    return { success: true, message: response.message ?? "Pengaturan homestay berhasil disimpan." };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Pengaturan belum dapat disimpan. Periksa koneksi lalu coba lagi." };
  }
}
