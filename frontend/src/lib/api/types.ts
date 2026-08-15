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
