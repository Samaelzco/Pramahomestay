"use client";

import { BedIcon, CalendarIcon } from "@/components/ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function InternalHeader({ userName }: { userName: string }) {
  const pathname = usePathname();
  const booking = pathname.startsWith("/internal/bookings");
  const Icon = booking ? CalendarIcon : BedIcon;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-surface/95 px-6 md:ml-[264px] md:px-10">
      <Link href={booking ? "/internal/bookings" : "/internal/rooms"} className="flex items-center gap-2.5 md:hidden"><span className="grid size-9 place-items-center rounded-md bg-primary text-white"><Icon className="size-4" /></span><span className="font-semibold">Prama</span></Link>
      <p className="hidden text-sm font-medium md:block">{booking ? "Operasional booking" : "Inventori kamar"}</p>
      <div className="text-right"><p className="text-sm font-medium">{userName}</p><p className="text-xs text-muted">Admin internal</p></div>
    </header>
  );
}
