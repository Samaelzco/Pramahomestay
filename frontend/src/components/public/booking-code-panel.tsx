"use client";

import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import type { ServerLocale } from "@/lib/locale-server";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

function fallbackCopy(value: string) {
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(input);
  if (!copied) throw new Error("Copy command failed");
}

export function BookingCodePanel({ bookingCode, locale }: { bookingCode: string; locale: ServerLocale }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = (id: string, en: string) => locale === "en" ? en : id;

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  async function copyCode() {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(bookingCode);
      else fallbackCopy(bookingCode);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2400);
  }

  const buttonLabel = copyState === "copied"
    ? t("Tersalin", "Copied")
    : copyState === "failed"
      ? t("Coba lagi", "Try again")
      : t("Salin kode", "Copy code");

  return <section aria-labelledby="booking-code-title" className="mt-8 bg-secondary-soft px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-7 sm:py-6">
    <div className="min-w-0">
      <h2 id="booking-code-title" className="text-sm font-semibold text-secondary">{t("Simpan kode booking ini", "Save this booking code")}</h2>
      <p className="mt-2 break-all text-[clamp(1.55rem,4vw,2.25rem)] leading-none font-semibold tracking-[-0.025em] tabular-nums">{bookingCode}</p>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
        {t("Gunakan kode ini untuk membuka kembali pembayaran melalui", "Use this code to reopen your payment from")}{" "}
        <Link href="/booking/status" className="font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 hover:decoration-secondary">{t("Cek pesanan", "Find booking")}</Link>.
        {" "}{t("Perangkat yang dipakai memesan juga mengingat pesanan selama 60 hari.", "The device used to book also remembers the reservation for 60 days.")}
      </p>
    </div>
    <button type="button" onClick={copyCode} className="mt-5 inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 bg-primary px-5 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 sm:mt-0 sm:w-auto" aria-live="polite">
      {copyState === "copied" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      {buttonLabel}
    </button>
  </section>;
}
