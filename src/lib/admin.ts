import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "./demo-data";
import { isSupabaseConfigured } from "./supabase/config";
import { createSupabaseServerClient } from "./supabase/server";
import type { Category, Order, Product } from "./types";

export type AdminContext =
  | { demo: true; email: string }
  | { demo: false; email: string; sb: Awaited<ReturnType<typeof createSupabaseServerClient>> };

/**
 * Returns the logged-in admin, or redirects to the login page.
 * In demo mode (no Supabase) the panel is viewable but read-only.
 */
export const requireAdmin = cache(async (): Promise<AdminContext> => {
  if (!isSupabaseConfigured) return { demo: true, email: "demo@ausm.com.bd" };
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: admin } = await sb.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=not_admin");
  return { demo: false, email: user.email ?? "", sb };
});

/** For server actions: returns the client or an error message. */
export async function adminWriteClient() {
  const ctx = await requireAdmin();
  if (ctx.demo) {
    return { sb: null, error: "Demo mode: connect Supabase to save changes (see README)." } as const;
  }
  return { sb: ctx.sb, error: null } as const;
}

// ---------- Reads ----------------------------------------------------

export async function adminGetCategories(): Promise<Category[]> {
  const ctx = await requireAdmin();
  if (ctx.demo) return DEMO_CATEGORIES;
  const { data } = await ctx.sb.from("categories").select("*").order("sort_order");
  return (data ?? []) as Category[];
}

export async function adminGetProducts(opts: { q?: string; category?: string } = {}): Promise<Product[]> {
  const ctx = await requireAdmin();
  if (ctx.demo) {
    let list = DEMO_PRODUCTS;
    if (opts.category) list = list.filter((p) => p.category_id === opts.category);
    if (opts.q) list = list.filter((p) => p.name.toLowerCase().includes(opts.q!.toLowerCase()));
    return list;
  }
  let query = ctx.sb
    .from("products")
    .select("*, variants(*), category:categories(*)")
    .order("created_at", { ascending: false });
  if (opts.category) query = query.eq("category_id", opts.category);
  if (opts.q) query = query.ilike("name", `%${opts.q.replace(/[%_,()]/g, " ")}%`);
  const { data } = await query;
  return (data ?? []) as Product[];
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const ctx = await requireAdmin();
  if (ctx.demo) return DEMO_PRODUCTS.find((p) => p.id === id) ?? null;
  const { data } = await ctx.sb
    .from("products")
    .select("*, variants(*), category:categories(*)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const p = data as Product;
  p.variants.sort((a, b) => a.sort_order - b.sort_order);
  return p;
}

const DEMO_ORDERS: Order[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    order_number: 1003,
    customer_name: "Sample Customer",
    phone: "01700000000",
    email: null,
    address: "House 12, Road 5, Dhanmondi",
    city: "Dhaka",
    zone: "inside_dhaka",
    note: "Call before delivery",
    payment_method: "cod",
    payment_ref: null,
    subtotal: 1500,
    delivery_charge: 70,
    total: 1570,
    status: "pending",
    admin_note: null,
    created_at: new Date().toISOString(),
    items: [
      { id: "i1", order_id: "", product_id: null, variant_id: null, product_name: "Signature Logo Tee", variant_name: "M", unit_price: 750, quantity: 2 },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    order_number: 1002,
    customer_name: "Another Customer",
    phone: "01800000000",
    email: null,
    address: "Agrabad, Chattogram",
    city: "Chattogram",
    zone: "outside_dhaka",
    note: null,
    payment_method: "bkash",
    payment_ref: "DEMO123ABC",
    subtotal: 2600,
    delivery_charge: 130,
    total: 2730,
    status: "shipped",
    admin_note: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { id: "i2", order_id: "", product_id: null, variant_id: null, product_name: "Heavyweight Pullover Hoodie", variant_name: "L", unit_price: 1950, quantity: 1 },
      { id: "i3", order_id: "", product_id: null, variant_id: null, product_name: "Embroidered Dad Cap", variant_name: "Standard", unit_price: 650, quantity: 1 },
    ],
  },
];

export async function adminGetOrders(opts: { status?: string; q?: string; page?: number } = {}) {
  const ctx = await requireAdmin();
  const pageSize = 30;
  const page = Math.max(1, opts.page ?? 1);
  if (ctx.demo) {
    const list = DEMO_ORDERS.filter((o) => !opts.status || o.status === opts.status);
    return { orders: list, total: list.length, pageSize, page };
  }
  let query = ctx.sb
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.q) {
    const q = opts.q.trim();
    if (/^\d{3,6}$/.test(q)) query = query.eq("order_number", Number(q));
    else query = query.or(`phone.ilike.%${q.replace(/[^\d]/g, "")}%,customer_name.ilike.%${q.replace(/[%_,()]/g, " ")}%`);
  }
  const { data, count } = await query;
  return { orders: (data ?? []) as Order[], total: count ?? 0, pageSize, page };
}

export async function adminGetOrder(id: string): Promise<Order | null> {
  const ctx = await requireAdmin();
  if (ctx.demo) return DEMO_ORDERS.find((o) => o.id === id) ?? null;
  const { data } = await ctx.sb.from("orders").select("*, items:order_items(*)").eq("id", id).maybeSingle();
  return (data as Order) ?? null;
}

export async function adminDashboard() {
  const ctx = await requireAdmin();
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }) + "T00:00:00+06:00").toISOString();

  if (ctx.demo) {
    const lowStock = DEMO_PRODUCTS.flatMap((p) =>
      p.variants.filter((v) => v.stock <= 3).map((v) => ({ product: p.name, productId: p.id, variant: v.name, stock: v.stock })),
    );
    return {
      ordersToday: 1,
      pending: DEMO_ORDERS.filter((o) => o.status === "pending").length,
      revenue30: DEMO_ORDERS.reduce((n, o) => n + o.total, 0),
      orders30: DEMO_ORDERS.length,
      lowStock: lowStock.slice(0, 10),
      recent: DEMO_ORDERS,
      productCount: DEMO_PRODUCTS.length,
    };
  }

  const sb = ctx.sb;
  const [todayRes, pendingRes, monthRes, lowRes, recentRes, prodRes] = await Promise.all([
    sb.from("orders").select("id", { count: "exact", head: true }).gte("created_at", today),
    sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("orders").select("total, status").gte("created_at", since30).not("status", "in", "(cancelled,returned)"),
    sb.from("variants").select("name, stock, product:products(id, name)").lte("stock", 3).order("stock").limit(10),
    sb.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    sb.from("products").select("id", { count: "exact", head: true }),
  ]);
  const month = (monthRes.data ?? []) as { total: number }[];
  type LowRow = { name: string; stock: number; product: { id: string; name: string } | null };
  return {
    ordersToday: todayRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    revenue30: month.reduce((n, o) => n + o.total, 0),
    orders30: month.length,
    lowStock: ((lowRes.data ?? []) as unknown as LowRow[]).map((r) => ({
      product: r.product?.name ?? "—",
      productId: r.product?.id ?? "",
      variant: r.name,
      stock: r.stock,
    })),
    recent: (recentRes.data ?? []) as Order[],
    productCount: prodRes.count ?? 0,
  };
}
