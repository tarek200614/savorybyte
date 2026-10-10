export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export type TableLocation = 'MAIN_HALL' | 'TERRACE' | 'PRIVATE_ROOM' | 'BAR';
export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'OUT_OF_SERVICE';

export interface RestaurantTable {
  id: string;
  table_number: string;
  capacity: number;
  location: TableLocation;
  status: TableStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Reservation {
  id: string;
  customer_id: string;
  table_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  party_size: number;
  status: ReservationStatus;
  special_requests?: string | null;
  created_at: string;
  updated_at: string;
  customer?: User;
  table?: RestaurantTable;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_available: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  preparation_time_mins: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface MenuItemChangeLog {
  id: string;
  timestamp: string;
  actor_email?: string | null;
  actor_name?: string | null;
  details: string;
  request_id?: string | null;
}

export type OrderStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'PAID'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  item_notes?: string | null;
  menu_item?: MenuItem;
}

export interface Order {
  id: string;
  customer_id?: string | null;
  table_id?: string | null;
  reservation_id?: string | null;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  notes?: string | null;
  created_at: string;
  items: OrderItem[];
  table?: RestaurantTable | null;
}

export interface DashboardSummary {
  total_revenue: number;
  reservations_today: number;
  total_tables: number;
  total_users: number;
}
