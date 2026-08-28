"use server";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ApiItem, PublicBookingActionState, PublicBookingResult } from "@/lib/api/types";
import { redirect } from "next/navigation";

export async function createPublicBookingAction(_state: PublicBookingActionState, formData: FormData): Promise<PublicBookingActionState> {
  const payload = {
    room_id: Number(formData.get("room_id")),
    check_in: String(formData.get("check_in") ?? ""),
    check_out: String(formData.get("check_out") ?? ""),
    guest_count: Number(formData.get("guest_count")),
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };

  let booking: PublicBookingResult;
  try {
    const response = await apiFetch<ApiItem<PublicBookingResult>>("/public/bookings", { method: "POST", body: JSON.stringify(payload) }, false);
    booking = response.data;
  } catch (error) {
    if (error instanceof ApiError) return { message: error.payload.message, errors: error.payload.errors };
    return { message: "Permintaan booking belum dapat dikirim. Silakan coba lagi." };
  }

  redirect(`/booking/payment/${booking.payment_token}`);
}
