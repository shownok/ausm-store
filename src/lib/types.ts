export type CategoryGroup = "Fashion" | "Accessories" | "Lifestyle" | "Phone & Tech";

export const CATEGORY_GROUPS: CategoryGroup[] = [
  "Fashion",
  "Accessories",
  "Lifestyle",
  "Phone & Tech",
];

export interface Category {
  id: string;
  name: string;
  slug: string;
  group_name: CategoryGroup;
  image_url: string | null;
  sort_order: number;
  active: boolean;
}

export interface Variant {
  id: string;
  product_id: string;
  name: string; // e.g. "M", "Black / L", "iPhone 15"
  sku: string | null;
  price: number | null; // overrides product price when set
  stock: number;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  price: number; // BDT, whole taka
  compare_at_price: number | null;
  images: string[];
  tags: string[];
  featured: boolean;
  active: boolean;
  created_at: string;
  variants: Variant[];
  category?: Category;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export type PaymentMethod = "cod" | "bkash" | "nagad";
export type DeliveryZone = "inside_dhaka" | "outside_dhaka";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  zone: DeliveryZone;
  note: string | null;
  payment_method: PaymentMethod;
  payment_ref: string | null;
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: OrderStatus;
  admin_note: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface StoreSettings {
  store_name: string;
  whatsapp: string; // international format without +, e.g. 8801XXXXXXXXX
  email: string;
  bkash_number: string;
  nagad_number: string;
  delivery_inside_dhaka: number;
  delivery_outside_dhaka: number;
  free_delivery_over: number | null;
  announcement: string;
}

export interface CartLine {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantName: string;
  price: number;
  image: string | null;
  categorySlug: string;
  quantity: number;
}
