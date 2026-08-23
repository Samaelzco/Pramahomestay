import { ArrowLeftIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, AuditLog } from "@/lib/api/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Detail Audit Log" };
const dateTime = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const fieldLabels: Record<string, string> = {
  name: "Nama", full_name: "Nama lengkap", display_name: "Nama role", email: "Email", phone: "Telepon",
  description: "Deskripsi", status: "Status", is_active: "Status aktif", role: "Role", permissions: "Hak akses",
  password_changed: "Password diubah",
  room_id: "Kamar", guest_id: "Tamu", guest_name: "Nama tamu", guest_email: "Email tamu", guest_phone: "Telepon tamu",
  check_in: "Check-in", check_out: "Check-out", guest_count: "Jumlah tamu", price_per_night: "Tarif per malam",
  total_nights: "Jumlah malam", total_amount: "Total", amount_paid: "Nominal dibayar", method: "Metode",
  paid_at: "Tanggal bayar", reference_number: "Nomor referensi", special_requests: "Permintaan khusus",
  internal_notes: "Catatan internal", notes: "Catatan", capacity: "Kapasitas", bed_count: "Jumlah tempat tidur",
  size_sqm: "Luas", type: "Tipe", amenities: "Fasilitas", image_url: "URL gambar", proof_url: "Bukti pembayaran",
};
const statusLabels: Record<string, string> = {
  ready: "Siap", occupied: "Ditempati", cleaning: "Dibersihkan", maintenance: "Perawatan",
  pending: "Menunggu", confirmed: "Dikonfirmasi", checked_in: "Check-in", checked_out: "Selesai", cancelled: "Dibatalkan",
  unpaid: "Belum dibayar", partial: "Dibayar sebagian", paid: "Lunas", failed: "Gagal", refunded: "Dikembalikan",
  cash: "Tunai", bank_transfer: "Transfer bank", qris: "QRIS", card: "Kartu",
};

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "Kosong";
  if (field === "is_active") return value ? "Aktif" : "Nonaktif";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (["price_per_night", "total_amount", "amount_paid"].includes(field) && !Number.isNaN(Number(value))) return currency.format(Number(value));
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "Kosong";
  if (typeof value === "object") return JSON.stringify(value);
  return statusLabels[String(value)] ?? String(value);
}

export default async function AuditLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: log } = await apiFetch<ApiItem<AuditLog>>(`/internal/audit-logs/${encodeURIComponent(id)}`);
  const fields = Array.from(new Set([...Object.keys(log.old_values ?? {}), ...Object.keys(log.new_values ?? {})]));

  return <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
    <Link href="/internal/audit-logs" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-secondary underline-offset-4 hover:underline"><ArrowLeftIcon className="size-4" />Kembali ke Audit Log</Link>
    <div className="mt-8"><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">{log.subject_label ?? `Aktivitas #${log.id}`}</h1><span className="inline-flex rounded-sm bg-secondary-soft px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#5f411b] uppercase">{log.action_label}</span></div><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{log.description}</p></div>
    <dl className="mt-10 grid gap-x-8 gap-y-5 border-y py-7 sm:grid-cols-2 lg:grid-cols-4">
      <div><dt className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">User</dt><dd className="mt-2 text-sm font-semibold">{log.actor?.name ?? "User terhapus"}</dd>{log.actor?.email && <dd className="mt-1 text-sm text-muted">{log.actor.email}</dd>}</div>
      <div><dt className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">Modul</dt><dd className="mt-2 text-sm font-semibold">{log.module_label}</dd></div>
      <div><dt className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">Waktu</dt><dd className="mt-2 text-sm font-semibold tabular-nums">{dateTime.format(new Date(log.created_at))}</dd></div>
      <div><dt className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">Alamat IP</dt><dd className="mt-2 text-sm font-semibold tabular-nums">{log.ip_address ?? "Tidak tersedia"}</dd></div>
    </dl>
    <section className="mt-10"><h2 className="text-2xl font-semibold tracking-[-0.02em]">Rincian perubahan</h2><p className="mt-2 text-sm leading-6 text-muted">Nilai sebelum dan sesudah aktivitas disimpan sebagai catatan read-only.</p>
      {fields.length ? <div className="mt-6 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]"><div className="hidden grid-cols-[200px_1fr_1fr] gap-6 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase sm:grid"><span>Field</span><span>Sebelum</span><span>Sesudah</span></div><dl className="divide-y">{fields.map((field) => <div key={field} className="grid gap-4 px-5 py-5 sm:grid-cols-[200px_1fr_1fr] sm:gap-6 sm:px-6"><dt className="text-sm font-semibold">{fieldLabels[field] ?? field.replaceAll("_", " ")}</dt><dd><span className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase sm:hidden">Sebelum</span><p className="mt-1 break-words text-sm leading-6 text-muted sm:mt-0">{formatValue(field, log.old_values?.[field])}</p></dd><dd><span className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase sm:hidden">Sesudah</span><p className="mt-1 break-words text-sm leading-6 font-medium sm:mt-0">{formatValue(field, log.new_values?.[field])}</p></dd></div>)}</dl></div> : <p className="mt-6 rounded-lg bg-surface px-6 py-12 text-center text-sm text-muted shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">Aktivitas ini tidak membawa perubahan field yang dapat ditampilkan.</p>}
    </section>
    <section className="mt-10 border-t pt-7"><h2 className="text-lg font-semibold">Konteks perangkat</h2><p className="mt-3 max-w-4xl break-words text-sm leading-7 text-muted">{log.user_agent ?? "Informasi perangkat tidak tersedia."}</p></section>
  </main>;
}
