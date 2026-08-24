"use client";

import { MobileSidebar } from "@/components/internal/sidebar";
import { MenuIcon } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/internal/theme-toggle";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export function InternalHeader({ userName, permissions }: { userName: string; permissions: string[] }) {
  const pathname = usePathname();
  const booking = pathname.startsWith("/internal/bookings");
  const payment = pathname.startsWith("/internal/payments");
  const dashboard = pathname.startsWith("/internal/dashboard");
  const guest = pathname.startsWith("/internal/guests");
  const users = pathname.startsWith("/internal/users");
  const context = dashboard ? "Ringkasan operasional" : booking ? "Operasional booking" : payment ? "Administrasi pembayaran" : guest ? "Hubungan tamu" : users ? "Administrasi akses" : "Inventori kamar";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  return <>
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-surface/95 px-6 sm:px-8 md:px-10 xl:ml-[264px]">
      <button ref={menuButtonRef} type="button" aria-label="Buka menu navigasi" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)} className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-white xl:hidden"><MenuIcon className="size-5" /></button>
      <p className="hidden text-sm font-medium sm:block">{context}</p>
      <ThemeToggle />
    </header>
    <div id="mobile-navigation"><MobileSidebar open={menuOpen} onClose={closeMenu} userName={userName} permissions={permissions} /></div>
  </>;
}
