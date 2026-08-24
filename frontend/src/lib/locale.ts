"use client";

import type { Amenity, Room } from "@/lib/api/types";
import { useSyncExternalStore } from "react";

export type Locale = "id" | "en";

const STORAGE_KEY = "prama-locale";

function localeSnapshot(): Locale {
  return document.documentElement.dataset.locale === "en" ? "en" : "id";
}

function applyLocale(locale: Locale) {
  document.documentElement.dataset.locale = locale;
  document.documentElement.lang = locale;
}

function subscribe(onStoreChange: () => void) {
  const announceLocale = () => onStoreChange();
  const syncStoredLocale = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    applyLocale(event.newValue === "en" ? "en" : "id");
    onStoreChange();
  };

  window.addEventListener("prama-locale-change", announceLocale);
  window.addEventListener("storage", syncStoredLocale);
  return () => {
    window.removeEventListener("prama-locale-change", announceLocale);
    window.removeEventListener("storage", syncStoredLocale);
  };
}

export function setLocale(locale: Locale) {
  applyLocale(locale);
  document.cookie = `${STORAGE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
  window.dispatchEvent(new Event("prama-locale-change"));
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, localeSnapshot, () => "id");
}

export function localize(locale: Locale, indonesia: string, english: string): string {
  return locale === "en" ? english : indonesia;
}

export function amenityName(amenity: Amenity, locale: Locale): string {
  return locale === "en" && amenity.name_en?.trim() ? amenity.name_en : amenity.name;
}

export function amenityDescription(amenity: Amenity, locale: Locale): string | null {
  return locale === "en" && amenity.description_en?.trim() ? amenity.description_en : amenity.description;
}

export function roomDescription(room: Room, locale: Locale): string | null {
  return locale === "en" && room.description_en?.trim() ? room.description_en : room.description;
}
