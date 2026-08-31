"use client";

import type { BookingStatus } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";

const styles: Record<BookingStatus, string> = {
  pending: "bg-[#f4ede3] text-[#68491f]",
  confirmed: "bg-[#e8edf4] text-[#304d72]",
  checked_in: "bg-[#edf4ef] text-[#28533b]",
  checked_out: "bg-surface-high text-primary",
  cancelled: "bg-[#ffdad6] text-[#93000a]",
};

export function BookingStatusBadge({ status, label }: { status: BookingStatus; label: string }) {
  const locale = useLocale();
  const labels: Record<BookingStatus, string> = { pending: "Pending", confirmed: "Confirmed", checked_in: "Checked in", checked_out: "Checked out", cancelled: "Cancelled" };
  return <span className={`inline-flex rounded-sm px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${styles[status]}`}>{localize(locale, label, labels[status])}</span>;
}
