import { apiDownload } from "@/lib/api/client";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const backendParams = new URLSearchParams();
  for (const key of ["format", "date_from", "date_to"]) {
    const value = params.get(key);
    if (value) backendParams.set(key, value);
  }

  const response = await apiDownload(`/internal/reports/export?${backendParams.toString()}`);
  if (response.status === 401) return Response.redirect(new URL("/internal/login", request.url));
  if (!response.ok) return Response.json({ message: "Laporan tidak dapat diekspor." }, { status: response.status });

  const headers = new Headers();
  headers.set("Content-Type", response.headers.get("content-type") ?? "application/octet-stream");
  const disposition = response.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);
  return new Response(response.body, { status: 200, headers });
}
