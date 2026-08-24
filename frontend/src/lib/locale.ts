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

const apiMessageTranslations: Record<string, string> = {
  "Server belum dapat dihubungi. Silakan coba kembali.": "The server could not be reached. Please try again.",
  "Data user belum dapat disimpan. Periksa koneksi lalu coba lagi.": "The user could not be saved. Check the connection and try again.",
  "Status user belum dapat diubah. Periksa koneksi lalu coba lagi.": "The user status could not be changed. Check the connection and try again.",
  "User belum dapat dihapus. Periksa koneksi lalu coba lagi.": "The user could not be deleted. Check the connection and try again.",
  "Role belum dapat ditambahkan. Periksa koneksi lalu coba lagi.": "The role could not be added. Check the connection and try again.",
  "Role belum dapat diperbarui. Periksa koneksi lalu coba lagi.": "The role could not be updated. Check the connection and try again.",
  "Role belum dapat dihapus. Periksa koneksi lalu coba lagi.": "The role could not be deleted. Check the connection and try again.",
  "Data tamu belum dapat disimpan. Periksa koneksi lalu coba lagi.": "The guest could not be saved. Check the connection and try again.",
  "Status tamu belum dapat diubah. Periksa koneksi lalu coba lagi.": "The guest status could not be changed. Check the connection and try again.",
  "Profil tamu belum dapat dihapus. Periksa koneksi lalu coba lagi.": "The guest profile could not be deleted. Check the connection and try again.",
  "Pembayaran belum dapat disimpan. Periksa koneksi lalu coba lagi.": "The payment could not be saved. Check the connection and try again.",
  "Pengembalian pembayaran belum dapat dicatat. Periksa koneksi lalu coba lagi.": "The refund could not be recorded. Check the connection and try again.",
  "Pengaturan belum dapat disimpan. Periksa koneksi lalu coba lagi.": "The settings could not be saved. Check the connection and try again.",
  "Pengaturan homestay berhasil disimpan.": "Homestay settings were saved successfully.",
  "Kamar belum dapat disimpan. Periksa koneksi lalu coba lagi.": "The room could not be saved. Check the connection and try again.",
  "Status kamar belum dapat diubah. Periksa koneksi lalu coba lagi.": "The room status could not be changed. Check the connection and try again.",
  "Kamar belum dapat dihapus. Periksa koneksi lalu coba lagi.": "The room could not be deleted. Check the connection and try again.",
  "Fasilitas belum dapat disimpan. Periksa koneksi lalu coba lagi.": "The amenity could not be saved. Check the connection and try again.",
  "Status fasilitas belum dapat diubah. Periksa koneksi lalu coba lagi.": "The amenity status could not be changed. Check the connection and try again.",
  "Fasilitas belum dapat dihapus. Periksa koneksi lalu coba lagi.": "The amenity could not be deleted. Check the connection and try again.",
  "Booking belum dapat disimpan. Periksa koneksi lalu coba lagi.": "The booking could not be saved. Check the connection and try again.",
  "Booking belum dapat dibatalkan. Periksa koneksi lalu coba lagi.": "The booking could not be cancelled. Check the connection and try again.",
  "Booking belum dapat dihapus. Periksa koneksi lalu coba lagi.": "The booking could not be deleted. Check the connection and try again.",
  "Email atau password tidak sesuai.": "The email or password is incorrect.",
  "Akun ini sedang dinonaktifkan. Hubungi administrator.": "This account is inactive. Contact an administrator.",
  "Akun ini tidak memiliki akses ke area internal.": "This account does not have access to the internal area.",
  "Booking yang dibatalkan tidak dapat diaktifkan kembali.": "A cancelled booking cannot be reactivated.",
  "Kamar yang dipilih sedang tidak aktif.": "The selected room is inactive.",
  "Kamar sudah memiliki booking pada rentang tanggal tersebut.": "The room already has a booking in that date range.",
  "Booking ini sudah memiliki data pembayaran.": "This booking already has a payment record.",
  "Booking ini sudah memiliki data pembayaran lain.": "This booking already has another payment record.",
  "Booking tidak dapat dihapus karena sudah memiliki data pembayaran.": "The booking cannot be deleted because it already has payment records.",
  "Booking yang sudah check-in atau selesai tidak dapat dibatalkan.": "A checked-in or completed booking cannot be cancelled.",
  "Fasilitas tidak dapat dihapus karena masih digunakan oleh kamar. Lepaskan dari kamar atau nonaktifkan sebagai gantinya.": "The amenity cannot be deleted because rooms still use it. Remove it from those rooms or deactivate it instead.",
  "Kamar tidak dapat dihapus karena sudah memiliki riwayat booking. Nonaktifkan kamar sebagai gantinya.": "The room cannot be deleted because it has booking history. Deactivate it instead.",
  "Role tidak dapat dihapus karena masih digunakan oleh user. Pindahkan role user terlebih dahulu.": "The role cannot be deleted because users still use it. Reassign those users first.",
  "Role sistem yang dilindungi tidak dapat diubah atau dihapus.": "A protected system role cannot be changed or deleted.",
  "Nama role harus mengandung setidaknya satu huruf atau angka.": "The role name must contain at least one letter or number.",
  "Role akun yang sedang digunakan tidak dapat diubah sendiri.": "You cannot change the role of the account currently in use.",
  "Akun yang sedang digunakan tidak dapat dinonaktifkan.": "The account currently in use cannot be deactivated.",
  "Akun yang sedang digunakan tidak dapat dihapus.": "The account currently in use cannot be deleted.",
  "User tidak dapat dihapus karena memiliki riwayat operasional. Nonaktifkan akun sebagai gantinya.": "The user cannot be deleted because they have operational history. Deactivate the account instead.",
  "Bukti pembayaran gagal disimpan.": "The payment receipt could not be saved.",
};

export function localizeApiMessage(locale: Locale, message: string): string {
  return locale === "en" ? apiMessageTranslations[message] ?? message : message;
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
