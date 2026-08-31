import type { ServerLocale } from "@/lib/locale-server";

type DeviceContext = {
  summary: string;
  raw: string;
};

function productWithVersion(userAgent: string, pattern: RegExp, name: string): string | null {
  const match = userAgent.match(pattern);
  return match ? `${name} ${match[1]}` : null;
}

function browserName(userAgent: string, locale: ServerLocale): string {
  return productWithVersion(userAgent, /Edg\/([\d.]+)/, "Edge")
    ?? productWithVersion(userAgent, /OPR\/([\d.]+)/, "Opera")
    ?? productWithVersion(userAgent, /(?:Chrome|CriOS)\/([\d.]+)/, "Chrome")
    ?? productWithVersion(userAgent, /(?:Firefox|FxiOS)\/([\d.]+)/, "Firefox")
    ?? productWithVersion(userAgent, /Version\/([\d.]+).*Safari\//, "Safari")
    ?? (/\bnode\b/i.test(userAgent) ? "Node.js" : locale === "id" ? "Browser tidak dikenal" : "Unknown browser");
}

function operatingSystem(userAgent: string, locale: ServerLocale): string {
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/(?:iPhone|iPad|iPod)/i.test(userAgent)) return "iOS/iPadOS";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  if (/\bnode\b/i.test(userAgent)) return locale === "id" ? "Server" : "Server";
  return locale === "id" ? "Sistem tidak dikenal" : "Unknown system";
}

function deviceType(userAgent: string, locale: ServerLocale): string | null {
  if (/\bnode\b/i.test(userAgent)) return null;
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) return locale === "id" ? "Tablet" : "Tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) return locale === "id" ? "Ponsel" : "Mobile";
  return locale === "id" ? "Desktop" : "Desktop";
}

export function describeDeviceContext(userAgent: string | null, locale: ServerLocale): DeviceContext | null {
  const raw = userAgent?.trim();
  if (!raw) return null;

  return {
    summary: [browserName(raw, locale), operatingSystem(raw, locale), deviceType(raw, locale)].filter(Boolean).join(" · "),
    raw,
  };
}
