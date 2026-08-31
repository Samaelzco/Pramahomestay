import "server-only";

import { cookies } from "next/headers";

const recentBookingCookie = "prama_recent_booking";

export async function rememberPublicBooking(token: string) {
  if (!/^[A-Za-z0-9]{64}$/.test(token)) return;

  (await cookies()).set(recentBookingCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
}

export async function recentPublicBookingToken(): Promise<string | null> {
  const token = (await cookies()).get(recentBookingCookie)?.value ?? "";
  return /^[A-Za-z0-9]{64}$/.test(token) ? token : null;
}
