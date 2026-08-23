import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api";
export const authCookieName = "prama_internal_token";

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  redirectOnUnauthorized = true,
): Promise<T> {
  const token = (await cookies()).get(authCookieName)?.value;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 && redirectOnUnauthorized) redirect("/internal/login");
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, payload);
  return payload as T;
}

export async function apiDownload(path: string): Promise<Response> {
  const token = (await cookies()).get(authCookieName)?.value;
  const headers = new Headers({ Accept: "*/*" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${apiUrl}${path}`, { headers, cache: "no-store" });
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: { message?: string; errors?: Record<string, string[]> },
  ) {
    super(payload.message ?? "Permintaan tidak dapat diproses.");
  }
}
