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
export type ActionState = { message?: string; errors?: Record<string, string[]> };

export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export type Booking = {
  id: number;
  booking_code: string;
  room: Room;
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
