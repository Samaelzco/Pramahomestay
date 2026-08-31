"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echo: Echo<"reverb"> | null = null;

export function getRealtimeEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  const host = process.env.NEXT_PUBLIC_REVERB_HOST;
  if (!key || !host) return null;

  if (!echo) {
    const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "https";
    const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? (scheme === "https" ? 443 : 80));

    echo = new Echo<"reverb">({
      broadcaster: "reverb",
      key,
      wsHost: host,
      wsPort: port,
      wssPort: port,
      forceTLS: scheme === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: "/api/internal/realtime/auth",
      Pusher,
    });
  }

  return echo;
}
