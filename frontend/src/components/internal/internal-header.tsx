"use client";

import { MobileSidebar } from "@/components/internal/sidebar";
import { LanguageToggle } from "@/components/internal/language-toggle";
import { ThemeToggle } from "@/components/internal/theme-toggle";
import { NotificationCenter } from "@/components/internal/notification-center";
import { MenuIcon } from "@/components/ui/icons";
import type { InternalNotificationSummary } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export function InternalHeader({ userName, permissions, notificationSummary }: { userName: string; permissions: string[]; notificationSummary: InternalNotificationSummary }) {
  const pathname = usePathname();
  const locale = useLocale();
  const booking = pathname.startsWith("/internal/bookings");
  const availability = pathname.startsWith("/internal/availability");
  const operations = pathname.startsWith("/internal/operations");
  const payment = pathname.startsWith("/internal/payments");
  const dashboard = pathname.startsWith("/internal/dashboard");
  const guest = pathname.startsWith("/internal/guests");
  const users = pathname.startsWith("/internal/users");
  const amenities = pathname.startsWith("/internal/amenities");
  const reports = pathname.startsWith("/internal/reports");
  const auditLogs = pathname.startsWith("/internal/audit-logs");
  const settings = pathname.startsWith("/internal/settings");
  const notifications = pathname.startsWith("/internal/notifications");
  const context = dashboard ? localize(locale, "Ringkasan operasional", "Operations overview") : operations ? localize(locale, "Operasional harian", "Daily operations") : availability ? localize(locale, "Ketersediaan kamar", "Room availability") : booking ? localize(locale, "Operasional booking", "Booking operations") : payment ? localize(locale, "Administrasi pembayaran", "Payment administration") : guest ? localize(locale, "Hubungan tamu", "Guest relations") : users ? localize(locale, "Administrasi akses", "Access administration") : amenities ? localize(locale, "Master fasilitas", "Amenities catalog") : reports ? localize(locale, "Pelaporan operasional", "Operations reporting") : auditLogs ? localize(locale, "Riwayat aktivitas", "Activity history") : notifications ? localize(locale, "Pusat notifikasi", "Notification center") : settings ? localize(locale, "Pengaturan properti", "Property settings") : localize(locale, "Inventori kamar", "Room inventory");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  return <>
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-surface/95 px-6 sm:px-8 md:px-10 xl:ml-[264px]">
      <button ref={menuButtonRef} type="button" aria-label={localize(locale, "Buka menu navigasi", "Open navigation menu")} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)} className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-white xl:hidden"><MenuIcon className="size-5" /></button>
      <p className="hidden text-sm font-medium sm:block">{context}</p>
      <div className="ml-auto flex items-center gap-2"><NotificationCenter initialSummary={notificationSummary} /><LanguageToggle /><ThemeToggle /></div>
    </header>
    <div id="mobile-navigation"><MobileSidebar open={menuOpen} onClose={closeMenu} userName={userName} permissions={permissions} /></div>
  </>;
}
