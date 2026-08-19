"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const userPayload = (formData: FormData, editing = false) => ({
  name: formData.get("name"),
  email: formData.get("email"),
  password: formData.get("password") || null,
  password_confirmation: formData.get("password_confirmation") || null,
  role: formData.get("role"),
  ...(editing ? {} : { is_active: formData.get("is_active") === "1" }),
});

async function save(path: string, method: "POST" | "PUT", formData: FormData, editing = false): Promise<ActionState | null> {
  try {
    await apiFetch(path, { method, body: JSON.stringify(userPayload(formData, editing)) });
    return null;
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Data user belum dapat disimpan. Periksa koneksi lalu coba lagi." };
  }
}

export async function createUserAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save("/internal/users", "POST", formData);
  if (error) return error;
  revalidatePath("/internal/users");
  redirect("/internal/users?success=created");
}

export async function updateUserAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save(`/internal/users/${id}`, "PUT", formData, true);
  if (error) return error;
  revalidatePath("/internal/users");
  revalidatePath(`/internal/users/${id}/edit`);
  redirect("/internal/users?success=updated");
}

export async function setUserActivationAction(id: number, isActive: boolean, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/users/${id}/activation`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) });
    revalidatePath("/internal/users");
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Status user belum dapat diubah. Periksa koneksi lalu coba lagi." };
  }
}

export async function deleteUserAction(id: number, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/users/${id}`, { method: "DELETE" });
    revalidatePath("/internal/users");
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "User belum dapat dihapus. Periksa koneksi lalu coba lagi." };
  }
}

const rolePayload = (formData: FormData) => ({
  display_name: formData.get("display_name"),
  description: formData.get("description") || null,
  permissions: formData.getAll("permissions").map(String),
});

export async function createRoleAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await apiFetch("/internal/access/roles", { method: "POST", body: JSON.stringify(rolePayload(formData)) });
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Role belum dapat ditambahkan. Periksa koneksi lalu coba lagi." };
  }
  revalidatePath("/internal/users/access");
  redirect("/internal/users/access?success=created");
}

export async function updateRoleAction(role: string, _state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await apiFetch(`/internal/access/roles/${role}`, { method: "PUT", body: JSON.stringify(rolePayload(formData)) });
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Role belum dapat diperbarui. Periksa koneksi lalu coba lagi." };
  }
  revalidatePath("/internal/users/access");
  revalidatePath("/internal/users");
  redirect("/internal/users/access?success=updated");
}

export async function deleteRoleAction(role: string, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/access/roles/${role}`, { method: "DELETE" });
    revalidatePath("/internal/users/access");
    revalidatePath("/internal/users");
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Role belum dapat dihapus. Periksa koneksi lalu coba lagi." };
  }
}
