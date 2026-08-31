import "server-only";

import { cookies, headers as requestHeaders } from "next/headers";
import { redirect } from "next/navigation";

const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api";
const configuredTimeout = Number(process.env.INTERNAL_API_TIMEOUT_MS);
const apiTimeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout >= 1_000
  ? Math.min(configuredTimeout, 120_000)
  : 12_000;
const downloadTimeoutMs = 60_000;
export const authCookieName = "prama_internal_token";

function requestSignal(signal: AbortSignal | null | undefined, timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function timeoutError(): ApiError {
  return new ApiError(504, { message: "Layanan membutuhkan waktu terlalu lama untuk merespons. Silakan coba lagi." });
}

async function forwardBrowserContext(outgoingHeaders: Headers): Promise<void> {
  const incomingHeaders = await requestHeaders();
  const userAgent = incomingHeaders.get("user-agent")?.trim();

  if (userAgent) outgoingHeaders.set("User-Agent", userAgent.slice(0, 500));
}

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
  await forwardBrowserContext(headers);

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: requestSignal(init.signal, apiTimeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") throw timeoutError();
    throw error;
  }

  if (response.status === 401 && redirectOnUnauthorized) redirect("/internal/login");
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, payload);
  return payload as T;
}

export async function apiDownload(path: string): Promise<Response> {
  const token = (await cookies()).get(authCookieName)?.value;
  const headers = new Headers({ Accept: "*/*" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  await forwardBrowserContext(headers);

  try {
    return await fetch(`${apiUrl}${path}`, {
      headers,
      cache: "no-store",
      signal: requestSignal(undefined, downloadTimeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") throw timeoutError();
    throw error;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: { message?: string; errors?: Record<string, string[]> },
  ) {
    super(payload.message ?? "Permintaan tidak dapat diproses.");
  }
}
