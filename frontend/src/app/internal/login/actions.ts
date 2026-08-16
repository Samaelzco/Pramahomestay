"use server";

import { ApiError, apiFetch, authCookieName } from "@/lib/api/client";
import type { ActionState } from "@/lib/api/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type LoginResponse = { token: string };

export async function loginAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const response = await apiFetch<LoginResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      },
      false,
    );

    (await cookies()).set(authCookieName, response.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        message: error.payload.message ?? "Email atau password tidak sesuai.",
        errors: error.payload.errors,
      };
    }

    return { message: "Server belum dapat dihubungi. Silakan coba kembali." };
  }

  redirect("/internal/dashboard");
}

export async function logoutAction(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" }, false);
  } finally {
    (await cookies()).delete(authCookieName);
  }

  redirect("/internal/login");
}
