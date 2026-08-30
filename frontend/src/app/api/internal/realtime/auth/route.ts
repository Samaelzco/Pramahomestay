import { authCookieName } from "@/lib/api/client";
import { cookies } from "next/headers";

const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api";

export async function POST(request: Request): Promise<Response> {
  const token = (await cookies()).get(authCookieName)?.value;
  if (!token) return Response.json({ message: "Unauthenticated." }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  const input = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries(await request.formData().catch(() => new FormData()));
  const socketId = typeof input.socket_id === "string" ? input.socket_id : "";
  const channelName = typeof input.channel_name === "string" ? input.channel_name : "";

  if (!/^\d+\.\d+$/.test(socketId) || !/^private-internal-users\.\d+$/.test(channelName)) {
    return Response.json({ message: "Invalid channel authorization request." }, { status: 422 });
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/broadcasting/auth`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return Response.json({ message: "Realtime authorization service is unavailable." }, { status: 503 });
  }

  const payload = await response.text();
  return new Response(payload, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
