"use client";

import { CheckIcon, ChevronDownIcon, GlobeIcon } from "@/components/ui/icons";
import { setLocale, useLocale, type Locale } from "@/lib/locale";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const languages: Array<{ value: Locale; short: string; label: string }> = [
  { value: "id", short: "ID", label: "Bahasa Indonesia" },
  { value: "en", short: "EN", label: "English" },
];

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function chooseLocale(next: Locale) {
    setLocale(next);
    setOpen(false);
    router.refresh();
  }

  const current = languages.find((language) => language.value === locale) ?? languages[0];

  return <div ref={containerRef} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label={locale === "en" ? "Change language" : "Ganti bahasa"} aria-expanded={open} aria-haspopup="menu" className="flex h-11 min-w-16 items-center justify-center gap-2 rounded-sm border bg-surface-low px-3 text-sm font-semibold transition-colors hover:bg-surface-high focus-visible:outline-offset-2"><GlobeIcon className="size-4.5" /><span>{current.short}</span><ChevronDownIcon className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} /></button>
    {open && <div role="menu" aria-label={locale === "en" ? "Language options" : "Pilihan bahasa"} className="absolute top-[calc(100%+8px)] right-0 z-40 w-52 overflow-hidden rounded-lg bg-surface p-1.5 shadow-[0_18px_42px_-20px_rgba(17,17,17,0.35)]">
      {languages.map((language) => <button key={language.value} type="button" role="menuitemradio" aria-checked={locale === language.value} onClick={() => chooseLocale(language.value)} className={`flex min-h-11 w-full items-center gap-3 rounded-sm px-3 text-left text-sm transition-colors hover:bg-surface-low ${locale === language.value ? "font-semibold text-secondary" : "text-muted"}`}><span className="w-6 text-xs font-semibold">{language.short}</span><span className="flex-1">{language.label}</span>{locale === language.value && <CheckIcon className="size-4" />}</button>)}
    </div>}
  </div>;
}
