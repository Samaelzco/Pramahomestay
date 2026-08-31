"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function normalize(formData: FormData) {
  const handling = String(formData.get("handling") ?? "normal");
  formData.delete("handling");
  formData.set("status", handling === "normal" ? "unpaid" : handling);
  if (!formData.get("method")) formData.delete("method");
  if (!formData.get("paid_at")) formData.delete("paid_at");
  if (!formData.get("reference_number")) formData.delete("reference_number");
  if (!formData.get("notes")) formData.delete("notes");
  const proof = formData.get("proof");
  if (proof instanceof File && proof.size === 0) formData.delete("proof");
  return formData;
}

async function save(path: string, formData: FormData, update = false): Promise<ActionState | null> {
  try {
    const body = normalize(formData);
    if (update) body.set("_method", "PUT");
    await apiFetch(path, { method: "POST", body });
    return null;
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Pembayaran belum dapat disimpan. Periksa koneksi lalu coba lagi." };
  }
}

export async function createPaymentAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save("/internal/payments", formData);
  if (error) return error;
  revalidatePath("/internal/payments");
  redirect("/internal/payments?success=created");
}

export async function updatePaymentAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  const error = await save(`/internal/payments/${id}`, formData, true);
  if (error) return error;
  revalidatePath("/internal/payments");
  revalidatePath(`/internal/payments/${id}`);
  redirect(`/internal/payments/${id}?success=updated`);
}

function revalidatePaymentReview(id: number) {
  revalidatePath("/internal/dashboard");
  revalidatePath("/internal/payments");
  revalidatePath(`/internal/payments/${id}`);
  revalidatePath("/internal/bookings");
  revalidatePath("/booking/payment/[token]", "page");
}

export async function verifyPaymentAction(id: number, _state: ActionState, _formData: FormData): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    await apiFetch(`/internal/payments/${id}/verify`, { method: "PATCH", body: JSON.stringify({}) });
    revalidatePaymentReview(id);
    redirect(`/internal/payments/${id}?success=verified`);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Pembayaran belum dapat diverifikasi. Periksa koneksi lalu coba lagi." };
  }
}

export async function rejectPaymentAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await apiFetch(`/internal/payments/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason: formData.get("reason") }) });
    revalidatePaymentReview(id);
    redirect(`/internal/payments/${id}?success=rejected`);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Bukti pembayaran belum dapat ditolak. Periksa koneksi lalu coba lagi." };
  }
}

export async function refundPaymentAction(id: number, _state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const response = await apiFetch<{ message?: string }>(`/internal/payments/${id}/refund`, { method: "PATCH", body: JSON.stringify({ reason: formData.get("reason") }) });
    revalidatePath("/internal/payments");
    revalidatePath(`/internal/payments/${id}`);
    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Pengembalian pembayaran belum dapat dicatat. Periksa koneksi lalu coba lagi." };
  }
}
