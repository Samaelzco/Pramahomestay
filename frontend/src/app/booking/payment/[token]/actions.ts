"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionState, ApiItem, PublicPaymentData } from "@/lib/api/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitPublicPaymentProofAction(token: string, _state: ActionState, formData: FormData): Promise<ActionState> {
  const proof = formData.get("proof");
  if (!(proof instanceof File) || proof.size === 0) {
    return { message: "Pilih bukti pembayaran untuk diunggah.", errors: { proof: ["Pilih bukti pembayaran untuk diunggah."] } };
  }

  try {
    await apiFetch<ApiItem<PublicPaymentData>>(`/public/payments/${token}/proof`, { method: "POST", body: formData }, false);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Bukti pembayaran belum dapat dikirim. Periksa koneksi lalu coba lagi." };
  }

  const path = `/booking/payment/${token}`;
  revalidatePath(path);
  redirect(`${path}?submitted=1`);
}
