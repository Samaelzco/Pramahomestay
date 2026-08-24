import { cookies } from "next/headers";

export type ServerLocale = "id" | "en";

export async function serverLocale(): Promise<ServerLocale> {
  return (await cookies()).get("prama-locale")?.value === "en" ? "en" : "id";
}

export function serverLocalize(locale: ServerLocale, indonesia: string, english: string): string {
  return locale === "en" ? english : indonesia;
}

export function localeCode(locale: ServerLocale): string {
  return locale === "en" ? "en-US" : "id-ID";
}
