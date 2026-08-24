import { apiDownload } from "@/lib/api/client";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const locale = await serverLocale();
  const params = request.nextUrl.searchParams;
  const backendParams = new URLSearchParams();
  for (const key of ["format", "date_from", "date_to"]) {
    const value = params.get(key);
    if (value) backendParams.set(key, value);
  }
  backendParams.set("locale", locale);

  const response = await apiDownload(`/internal/reports/export?${backendParams.toString()}`);
  if (response.status === 401) return Response.redirect(new URL("/internal/login", request.url));
  if (!response.ok) return Response.json({ message: serverLocalize(locale, "Laporan tidak dapat diekspor.", "The report could not be exported.") }, { status: response.status });

  const headers = new Headers();
  headers.set("Content-Type", response.headers.get("content-type") ?? "application/octet-stream");
  const disposition = response.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);
  return new Response(response.body, { status: 200, headers });
}
