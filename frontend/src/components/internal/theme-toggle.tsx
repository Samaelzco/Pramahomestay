"use client";

import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "prama-theme";

function browserTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#111313" : "#f9f9f9");
}

function subscribe(onStoreChange: () => void) {
  const announceTheme = () => onStoreChange();
  const syncStoredTheme = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    applyTheme(browserTheme());
    onStoreChange();
  };
  const followSystem = (event: MediaQueryListEvent) => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {}
    applyTheme(event.matches ? "dark" : "light");
    onStoreChange();
  };

  window.addEventListener("prama-theme-change", announceTheme);
  window.addEventListener("storage", syncStoredTheme);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", followSystem);
  return () => {
    window.removeEventListener("prama-theme-change", announceTheme);
    window.removeEventListener("storage", syncStoredTheme);
    media.removeEventListener("change", followSystem);
  };
}

function themeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, themeSnapshot, () => "light");

  function toggleTheme() {
    const next = themeSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.classList.add("theme-transition");
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event("prama-theme-change"));
    window.setTimeout(() => document.documentElement.classList.remove("theme-transition"), 220);
  }

  const label = theme === "dark" ? "Gunakan mode terang" : "Gunakan mode gelap";

  return <button type="button" onClick={toggleTheme} aria-label={label} aria-pressed={theme === "dark"} title={label} className="ml-auto grid size-11 shrink-0 place-items-center rounded-sm border bg-surface-low text-primary transition-colors hover:bg-surface-high focus-visible:outline-offset-2"><SunIcon className="theme-show-light size-5" /><MoonIcon className="theme-show-dark size-5" /></button>;
}
