"use client";

import { MobileSidebar } from "@/components/internal/sidebar";
import { MenuIcon } from "@/components/ui/icons";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export function InternalHeader({ userName }: { userName: string }) {
  const pathname = usePathname();
  const booking = pathname.startsWith("/internal/bookings");
  const payment = pathname.startsWith("/internal/payments");
  const dashboard = pathname.startsWith("/internal/dashboard");
  const context = dashboard ? "Ringkasan operasional" : booking ? "Operasional booking" : payment ? "Administrasi pembayaran" : "Inventori kamar";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  return <>
    <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-surface/95 px-6 md:ml-[264px] md:px-10">
      <button ref={menuButtonRef} type="button" aria-label="Buka menu navigasi" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)} className="grid size-11 place-items-center rounded-md bg-primary text-white md:hidden"><MenuIcon className="size-5" /></button>
      <p className="hidden text-sm font-medium md:block">{context}</p>
    </header>
    <div id="mobile-navigation"><MobileSidebar open={menuOpen} onClose={closeMenu} userName={userName} /></div>
  </>;
}
