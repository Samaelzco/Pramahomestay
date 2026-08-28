export type DisplayLocale = "id" | "en";

const choose = (locale: DisplayLocale, id: string, en: string) => locale === "en" ? en : id;

const bookingStatuses: Record<string, [string, string]> = {
  pending: ["Menunggu", "Pending"], confirmed: ["Dikonfirmasi", "Confirmed"],
  checked_in: ["Check-in", "Checked in"], checked_out: ["Selesai", "Checked out"], cancelled: ["Dibatalkan", "Cancelled"],
};
const paymentStatuses: Record<string, [string, string]> = {
  unpaid: ["Belum dibayar", "Unpaid"], pending_verification: ["Menunggu verifikasi", "Pending verification"], partial: ["Dibayar sebagian", "Partially paid"], paid: ["Lunas", "Paid"],
  failed: ["Gagal", "Failed"], refunded: ["Dikembalikan", "Refunded"],
};
const roomStatuses: Record<string, [string, string]> = {
  ready: ["Siap", "Ready"], occupied: ["Ditempati", "Occupied"], cleaning: ["Dibersihkan", "Cleaning"], maintenance: ["Perawatan", "Maintenance"],
};
const paymentMethods: Record<string, [string, string]> = {
  cash: ["Tunai", "Cash"], bank_transfer: ["Transfer bank", "Bank transfer"], qris: ["QRIS", "QRIS"], card: ["Kartu", "Card"],
};
const auditActions: Record<string, [string, string]> = {
  created: ["Ditambahkan", "Created"], updated: ["Diperbarui", "Updated"], activated: ["Diaktifkan", "Activated"],
  deactivated: ["Dinonaktifkan", "Deactivated"], cancelled: ["Dibatalkan", "Cancelled"], refunded: ["Dikembalikan", "Refunded"],
  deleted: ["Dihapus", "Deleted"], exported: ["Diekspor", "Exported"],
};
const modules: Record<string, [string, string]> = {
  dashboard: ["Ringkasan", "Overview"], reports: ["Laporan", "Reports"], rooms: ["Kamar", "Rooms"], amenities: ["Fasilitas", "Amenities"],
  bookings: ["Booking", "Bookings"], payments: ["Pembayaran", "Payments"], guests: ["Tamu", "Guests"], users: ["User", "Users"],
  roles: ["Hak akses", "Access control"], audit_logs: ["Audit Log", "Audit Log"], settings: ["Pengaturan", "Settings"],
};
const fieldNames: Record<string, [string, string]> = {
  name: ["Nama", "Name"], name_en: ["Nama (English)", "Name (English)"], full_name: ["Nama lengkap", "Full name"], display_name: ["Nama role", "Role name"], email: ["Email", "Email"], phone: ["Telepon", "Phone"],
  description: ["Deskripsi", "Description"], description_en: ["Deskripsi (English)", "Description (English)"], status: ["Status", "Status"], is_active: ["Status aktif", "Active status"], role: ["Role", "Role"], permissions: ["Hak akses", "Permissions"], password_changed: ["Password diubah", "Password changed"],
  address: ["Alamat", "Address"], maps_url: ["Tautan Google Maps", "Google Maps link"], logo_path: ["File logo", "Logo file"], logo_url: ["URL logo", "Logo URL"], check_in_time: ["Jam check-in", "Check-in time"], check_out_time: ["Jam check-out", "Check-out time"], timezone: ["Zona waktu", "Time zone"], currency: ["Mata uang", "Currency"],
  bank_name: ["Nama bank", "Bank name"], bank_account_number: ["Nomor rekening", "Account number"], bank_account_holder: ["Pemilik rekening", "Account holder"], qris_notes: ["Informasi QRIS", "QRIS information"], booking_code_prefix: ["Prefix booking", "Booking prefix"], payment_code_prefix: ["Prefix pembayaran", "Payment prefix"], cancellation_policy: ["Kebijakan pembatalan", "Cancellation policy"], payment_instructions: ["Instruksi pembayaran", "Payment instructions"],
  room_id: ["Kamar", "Room"], guest_id: ["Tamu", "Guest"], guest_name: ["Nama tamu", "Guest name"], guest_email: ["Email tamu", "Guest email"], guest_phone: ["Telepon tamu", "Guest phone"], check_in: ["Check-in", "Check-in"], check_out: ["Check-out", "Check-out"], guest_count: ["Jumlah tamu", "Guest count"], price_per_night: ["Tarif per malam", "Nightly rate"], total_nights: ["Jumlah malam", "Night count"], total_amount: ["Total", "Total"], amount_paid: ["Nominal dibayar", "Amount paid"], method: ["Metode", "Method"], paid_at: ["Tanggal bayar", "Payment date"], reference_number: ["Nomor referensi", "Reference number"], special_requests: ["Permintaan khusus", "Special requests"], internal_notes: ["Catatan internal", "Internal notes"], notes: ["Catatan", "Notes"], capacity: ["Kapasitas", "Capacity"], bed_count: ["Jumlah tempat tidur", "Bed count"], amenities: ["Fasilitas", "Amenities"], image_url: ["URL gambar", "Image URL"], proof_url: ["Bukti pembayaran", "Payment receipt"],
};

function mappedLabel(map: Record<string, [string, string]>, key: string | null | undefined, fallback: string, locale: DisplayLocale) {
  const value = key ? map[key] : undefined;
  return value ? value[locale === "en" ? 1 : 0] : fallback;
}

export const bookingStatusLabel = (status: string, fallback: string, locale: DisplayLocale) => mappedLabel(bookingStatuses, status, fallback, locale);
export const paymentStatusLabel = (status: string, fallback: string, locale: DisplayLocale) => mappedLabel(paymentStatuses, status, fallback, locale);
export const roomStatusLabel = (status: string, fallback: string, locale: DisplayLocale) => mappedLabel(roomStatuses, status, fallback, locale);
export const paymentMethodLabel = (method: string | null | undefined, fallback: string, locale: DisplayLocale) => mappedLabel(paymentMethods, method, fallback, locale);
export const auditActionLabel = (action: string, fallback: string, locale: DisplayLocale) => mappedLabel(auditActions, action, fallback, locale);
export const moduleLabel = (module: string, fallback: string, locale: DisplayLocale) => mappedLabel(modules, module, fallback, locale);
export const fieldLabel = (field: string, locale: DisplayLocale) => mappedLabel(fieldNames, field, field.replaceAll("_", " "), locale);

export function roleLabel(name: string, fallback: string, locale: DisplayLocale): string {
  if (name === "admin") return choose(locale, "Administrator", "Administrator");
  if (name === "staff") return choose(locale, "Staff", "Staff");
  return fallback;
}

export function roleDescription(name: string, fallback: string | null | undefined, locale: DisplayLocale): string {
  if (name === "admin") return choose(locale, "Akses penuh ke seluruh fitur internal dan pengaturan sistem.", "Full access to all internal features and system settings.");
  if (name === "staff") return choose(locale, "Akses operasional harian sesuai permission yang dipilih.", "Daily operational access based on the selected permissions.");
  return fallback || choose(locale, "Belum ada deskripsi tanggung jawab.", "No responsibility description yet.");
}

export function permissionLabel(name: string, fallback: string, locale: DisplayLocale): string {
  if (locale === "id") return fallback;
  const [module, action] = name.split(".");
  const actionLabels: Record<string, string> = { view: "View", create: "Add", update: "Update", export: "Export" };
  const singularModules: Record<string, string> = { dashboard: "dashboard", reports: "reports", rooms: "rooms", amenities: "amenities", bookings: "bookings", payments: "payments", guests: "guests", users: "users", roles: "roles", audit_logs: "activity history", settings: "settings" };
  return actionLabels[action] && singularModules[module] ? `${actionLabels[action]} ${singularModules[module]}` : fallback;
}

export function auditDescription(action: string, module: string, subject: string | null | undefined, fallback: string, locale: DisplayLocale): string {
  if (locale === "id") return fallback;
  const target = subject || moduleLabel(module, module, locale);
  const verbs: Record<string, string> = { created: "Created", updated: "Updated", activated: "Activated", deactivated: "Deactivated", cancelled: "Cancelled", refunded: "Refunded", deleted: "Deleted", exported: "Exported" };
  return `${verbs[action] ?? "Changed"} ${target}.`;
}

export function enumValueLabel(value: unknown, locale: DisplayLocale): string | null {
  const key = String(value);
  for (const map of [bookingStatuses, paymentStatuses, roomStatuses, paymentMethods]) {
    if (map[key]) return map[key][locale === "en" ? 1 : 0];
  }
  return null;
}
