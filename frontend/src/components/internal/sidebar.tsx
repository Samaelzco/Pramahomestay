"use client";

import { logoutAction } from "@/app/internal/login/actions";
import { AmenitiesIcon, BedIcon, CalendarIcon, ChartIcon, GridIcon, HistoryIcon, HomeIcon, LogOutIcon, SettingsIcon, ShieldIcon, UsersIcon, WalletIcon, XIcon } from "@/components/ui/icons";
import { localize, useLocale } from "@/lib/locale";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type KeyboardEvent } from "react";

const navItems = [
  { id: "Ringkasan", en: "Overview", href: "/internal/dashboard", icon: GridIcon, permission: "dashboard.view" },
  { id: "Booking", en: "Bookings", href: "/internal/bookings", icon: CalendarIcon, permission: "bookings.view" },
  { id: "Pembayaran", en: "Payments", href: "/internal/payments", icon: WalletIcon, permission: "payments.view" },
  { id: "Kamar", en: "Rooms", href: "/internal/rooms", icon: BedIcon, permission: "rooms.view" },
  { id: "Fasilitas", en: "Amenities", href: "/internal/amenities", icon: AmenitiesIcon, permission: "amenities.view" },
  { id: "Tamu", en: "Guests", href: "/internal/guests", icon: UsersIcon, permission: "guests.view" },
  { id: "Laporan", en: "Reports", href: "/internal/reports", icon: ChartIcon, permission: "reports.view" },
  { id: "User & akses", en: "Users & access", href: "/internal/users", icon: ShieldIcon, permission: "users.view" },
  { id: "Audit Log", en: "Audit log", href: "/internal/audit-logs", icon: HistoryIcon, permission: "audit_logs.view" },
  { id: "Pengaturan", en: "Settings", href: "/internal/settings", icon: SettingsIcon, permission: "settings.view" },
];

function InternalNavigation({ permissions, onNavigate }: { permissions: string[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const locale = useLocale();
  return <nav aria-label={localize(locale, "Navigasi internal", "Internal navigation")}><ul className="space-y-1">{navItems.filter((item) => permissions.includes(item.permission)).map(({ id, en, href, icon: NavIcon }) => {
    const active = pathname.startsWith(href);
    return <li key={id}>
      <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors active:bg-surface-high ${active ? "bg-surface-low font-semibold text-secondary after:ml-auto after:size-1.5 after:rounded-full after:bg-secondary" : "text-muted hover:bg-surface-low hover:text-primary"}`}><NavIcon className="size-5" />{localize(locale, id, en)}</Link>
    </li>;
  })}</ul></nav>;
}

function AccountFooter({ userName }: { userName: string }) {
  const locale = useLocale();
  return <div className="border-t pt-5"><p className="truncate px-3 text-sm font-medium">{userName}</p><p className="px-3 pt-1 text-xs text-muted">{localize(locale, "Tim internal", "Internal team")}</p><form action={logoutAction} className="mt-4"><button className="flex min-h-11 w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-low hover:text-primary active:bg-surface-high"><LogOutIcon className="size-4" />{localize(locale, "Keluar", "Sign out")}</button></form></div>;
}

export function Sidebar({ userName, permissions }: { userName: string; permissions: string[] }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r bg-surface px-4 py-6 xl:flex xl:flex-col">
      <div className="flex items-center gap-3 px-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-white"><HomeIcon className="size-6" /></span>
        <div><p className="text-lg leading-tight font-semibold tracking-[-0.02em]">Prama Homestay</p><p className="mt-1 text-[10px] font-semibold tracking-[0.13em] text-muted uppercase">Management</p></div>
      </div>
      <div className="mt-14 flex-1"><InternalNavigation permissions={permissions} /></div>
      <AccountFooter userName={userName} />
    </aside>
  );
}

export function MobileSidebar({ open, onClose, userName, permissions }: { open: boolean; onClose: () => void; userName: string; permissions: string[] }) {
  const locale = useLocale();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return <div aria-hidden={!open} className={`fixed inset-0 z-50 xl:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
    <button type="button" tabIndex={-1} aria-label={localize(locale, "Tutup menu navigasi", "Close navigation menu")} onClick={onClose} className={`absolute inset-0 bg-primary/40 transition-opacity duration-200 ease-out motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`} />
    <aside ref={dialogRef} inert={!open} role="dialog" aria-modal="true" aria-label={localize(locale, "Menu navigasi", "Navigation menu")} onKeyDown={handleKeyDown} className={`absolute inset-y-0 left-0 flex w-[min(320px,86vw)] flex-col bg-surface px-4 py-6 shadow-[18px_0_48px_-24px_rgba(17,17,17,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between gap-4 px-3"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-md bg-primary text-white"><HomeIcon className="size-5" /></span><div><p className="font-semibold tracking-[-0.02em]">Prama Homestay</p><p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">Management</p></div></div><button ref={closeRef} type="button" onClick={onClose} aria-label={localize(locale, "Tutup menu", "Close menu")} className="grid size-12 shrink-0 place-items-center rounded-sm text-muted transition-colors hover:bg-surface-low hover:text-primary active:bg-surface-high"><XIcon className="size-5" /></button></div>
      <div className="mt-10 flex-1 overflow-y-auto"><InternalNavigation permissions={permissions} onNavigate={onClose} /></div>
      <AccountFooter userName={userName} />
    </aside>
  </div>;
}
