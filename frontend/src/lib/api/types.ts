export type RoomStatus = "ready" | "occupied" | "cleaning" | "maintenance";
export type RoomType = "studio" | "suite" | "loft" | "deluxe";

export type Room = {
  id: number;
  name: string;
  slug: string;
  type: RoomType;
  type_label: string;
  status: RoomStatus;
  status_label: string;
  description: string | null;
  price_per_night: string;
  capacity: number;
  bed_count: number;
  size_sqm: string | null;
  image_url: string | null;
  amenities: string[];
  is_active: boolean;
  can_delete: boolean;
  delete_block_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type PaginatedRooms = { data: Room[]; meta: PaginationMeta };
export type ApiItem<T> = { data: T; message?: string };
export type ActionState = { message?: string; errors?: Record<string, string[]>; success?: boolean };

export type InternalUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  role_labels: string[];
  permissions: string[];
  is_active: boolean;
  is_self: boolean;
  can_change_status: boolean;
  can_delete: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PaginatedUsers = { data: InternalUser[]; meta: PaginationMeta };

export type AuditAction = "created" | "updated" | "deleted" | "activated" | "deactivated" | "cancelled" | "refunded" | "exported";
export type AuditModule = "rooms" | "bookings" | "payments" | "guests" | "users" | "roles" | "settings" | "reports";

export type AuditLog = {
  id: number;
  actor: { id: number; name: string; email: string } | null;
  action: AuditAction;
  action_label: string;
  module: AuditModule;
  module_label: string;
  subject_id: number | null;
  subject_label: string | null;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type PaginatedAuditLogs = {
  data: AuditLog[];
  meta: PaginationMeta;
  filter_options: { actors: Array<{ id: number; name: string }> };
};

export type HomestaySettings = {
  id: number;
  name: string;
  address: string;
  maps_url: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  timezone: "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura";
  currency: "IDR";
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  qris_notes: string | null;
  booking_code_prefix: string;
  payment_code_prefix: string;
  cancellation_policy: string | null;
  payment_instructions: string | null;
  updated_at: string;
};

export type AccessRole = {
  name: string;
  label: string;
  description: string | null;
  is_protected: boolean;
  user_count: number;
  can_delete: boolean;
  permissions: string[];
};

export type AccessMatrix = {
  groups: Array<{ key: string; label: string; permissions: Array<{ name: string; label: string }> }>;
  roles: AccessRole[];
};

export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export type GuestReference = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
};

export type Booking = {
  id: number;
  booking_code: string;
  room: Room;
  guest?: GuestReference;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  price_per_night: string;
  total_nights: number;
  total_amount: string;
  status: BookingStatus;
  status_label: string;
  can_delete: boolean;
  delete_block_reason: string | null;
  special_requests: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PaginatedBookings = { data: Booking[]; meta: PaginationMeta };

export type PaymentMethod = "cash" | "bank_transfer" | "qris" | "card";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "failed" | "refunded";

export type Payment = {
  id: number;
  payment_code: string;
  booking: Booking;
  amount_paid: string;
  credited_amount: string;
  remaining_amount: string;
  method: PaymentMethod | null;
  method_label: string | null;
  status: PaymentStatus;
  status_label: string;
  reference_number: string | null;
  paid_at: string | null;
  notes: string | null;
  proof_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PaginatedPayments = { data: Payment[]; meta: PaginationMeta };

export type Guest = GuestReference & {
  is_active: boolean;
  can_delete: boolean;
  delete_block_reason: string | null;
  address: string | null;
  notes: string | null;
  stats: {
    bookings: number;
    completed_stays: number;
    total_booking_value: string;
    total_paid: string;
    latest_check_in: string | null;
  };
  bookings?: Booking[];
  created_at: string;
  updated_at: string;
};

export type PaginatedGuests = { data: Guest[]; meta: PaginationMeta };

export type DashboardBookingRow = {
  id: number;
  booking_code: string;
  guest_name: string;
  room_name: string | null;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  status_label: string;
  total_amount: string;
};

export type DashboardFollowup = {
  id: number;
  booking_code: string;
  guest_name: string;
  room_name: string | null;
  check_in: string;
  remaining_amount: string;
  payment_status: PaymentStatus;
  payment_status_label: string;
};

export type DashboardSummary = {
  period: { days: 7 | 30 | 90 | null; start: string; end: string; granularity: "day" | "week" | "month"; is_custom: boolean };
  metrics: {
    bookings: number;
    revenue: string;
    occupancy_rate: number;
    occupied_rooms: number;
    active_rooms: number;
    outstanding: string;
    arrivals_today: number;
    departures_today: number;
  };
  series: Array<{ date: string; end_date: string; bookings: number; revenue: string; occupancy_rate: number }>;
  booking_statuses: Array<{ status: BookingStatus; label: string; count: number }>;
  payment_statuses: Array<{ status: PaymentStatus; label: string; count: number }>;
  operations: { date: string; arrivals: DashboardBookingRow[]; departures: DashboardBookingRow[] };
  recent_bookings: DashboardBookingRow[];
  payment_followups: DashboardFollowup[];
};

export type ReportSummary = {
  period: { start: string; end: string; days: number };
  previous_period: { start: string; end: string; days: number };
  metrics: { revenue: string; bookings: number; occupancy_rate: number; occupied_nights: number; available_nights: number; payments: number; average_booking_value: string };
  previous_metrics: { revenue: string; bookings: number; occupancy_rate: number; occupied_nights: number; available_nights: number; payments: number; average_booking_value: string };
  comparison: { revenue_percent: number | null; bookings_percent: number | null; occupancy_points: number; payments_percent: number | null };
  rooms: Array<{ id: number; name: string; type_label: string; bookings: number; occupied_nights: number; occupancy_rate: number; booking_value: string; revenue: string }>;
  payment_methods: Array<{ method: PaymentMethod; label: string; count: number; amount: string }>;
  transactions: Array<{ id: number; payment_code: string; paid_at: string | null; created_at: string; booking_id: number; booking_code: string; guest_name: string; room_name: string; method: PaymentMethod | null; method_label: string; status: PaymentStatus; status_label: string; amount: string }>;
  can_export: boolean;
};
