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
