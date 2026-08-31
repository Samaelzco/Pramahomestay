"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ApiItem, PublicBookingRecoveryResult, ActionState } from "@/lib/api/types";
import { rememberPublicBooking } from "@/lib/public-booking-server";
import { redirect } from "next/navigation";

export async function recoverPublicBookingAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const payload = {
    booking_code: String(formData.get("booking_code") ?? "").trim().toUpperCase(),
    contact: String(formData.get("contact") ?? "").trim(),
    website: String(formData.get("website") ?? ""),
  };

  let result: PublicBookingRecoveryResult;
  try {
    result = (await apiFetch<ApiItem<PublicBookingRecoveryResult>>("/public/bookings/recover", {
      method: "POST",
      body: JSON.stringify(payload),
    }, false)).data;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) return { message: "Terlalu banyak percobaan. Tunggu sebentar lalu coba kembali." };
      return { message: error.payload.message, errors: error.payload.errors };
    }
    return { message: "Pesanan belum dapat dicari. Periksa koneksi lalu coba kembali." };
  }

  await rememberPublicBooking(result.payment_token);
  redirect(`/booking/payment/${result.payment_token}?recovered=1`);
}
