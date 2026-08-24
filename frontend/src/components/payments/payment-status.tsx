"use client";

import type { PaymentStatus as Status } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";

const styles: Record<Status, string> = {
  unpaid: "bg-[#f2ece2] text-[#6d5733]",
  partial: "bg-[#fff0cc] text-[#735500]",
  paid: "bg-[#dcefe3] text-[#28533b]",
  failed: "bg-[#ffdad6] text-[#93000a]",
  refunded: "bg-[#e8e4f2] text-[#514568]",
};

export function PaymentStatus({ status, label }: { status: Status; label: string }) {
  const locale = useLocale();
  const labels: Record<Status, string> = { unpaid: "Unpaid", partial: "Partially paid", paid: "Paid", failed: "Failed", refunded: "Refunded" };
  return <span className={`inline-flex rounded-sm px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${styles[status]}`}>{localize(locale, label, labels[status])}</span>;
}
