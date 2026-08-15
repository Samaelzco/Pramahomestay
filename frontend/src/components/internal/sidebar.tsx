import { logoutAction } from "@/app/internal/login/actions";
import { BedIcon, CalendarIcon, ChartIcon, GridIcon, HomeIcon, LogOutIcon, UsersIcon } from "@/components/ui/icons";
import Link from "next/link";

const navItems = [
  { label: "Ringkasan", href: "#", icon: GridIcon, disabled: true },
  { label: "Booking", href: "#", icon: CalendarIcon, disabled: true },
  { label: "Kamar", href: "/internal/rooms", icon: BedIcon },
  { label: "Tamu", href: "#", icon: UsersIcon, disabled: true },
  { label: "Analitik", href: "#", icon: ChartIcon, disabled: true },
];

export function Sidebar({ userName }: { userName: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r bg-surface px-4 py-6 md:flex md:flex-col">
      <div className="flex items-center gap-3 px-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-white"><HomeIcon className="size-6" /></span>
        <div><p className="text-lg leading-tight font-semibold tracking-[-0.02em]">Prama Homestay</p><p className="mt-1 text-[10px] font-semibold tracking-[0.13em] text-muted uppercase">Management</p></div>
      </div>
      <nav aria-label="Navigasi internal" className="mt-14 flex-1">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: NavIcon, disabled }) => (
            <li key={label}>
              {disabled ? (
                <span aria-disabled="true" className="flex items-center gap-3 rounded-md px-4 py-3 text-sm text-muted/55"><NavIcon className="size-5" />{label}<span className="ml-auto text-[10px] tracking-wide uppercase">Nanti</span></span>
              ) : (
                <Link href={href} className="flex items-center gap-3 rounded-md bg-surface-low px-4 py-3 text-sm font-semibold text-secondary after:ml-auto after:size-1.5 after:rounded-full after:bg-secondary"><NavIcon className="size-5" />{label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t pt-5">
        <p className="truncate px-3 text-sm font-medium">{userName}</p>
        <p className="px-3 pt-1 text-xs text-muted">Tim internal</p>
        <form action={logoutAction} className="mt-4">
          <button className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-low hover:text-primary"><LogOutIcon className="size-4" />Keluar</button>
        </form>
      </div>
    </aside>
  );
}
