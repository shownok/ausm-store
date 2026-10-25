import "server-only";
import { cache } from "react";
import { DEMO_CATEGORIES, DEMO_PRODUCTS, DEMO_SETTINGS } from "./demo-data";
import { isSupabaseConfigured } from "./supabase/config";
import { createSupabasePublicClient } from "./supabase/server";
import type { Category, Product, StoreSettings } from "./types";

export type SortKey = "newest" | "price-asc" | "price-desc" | "featured";

const PRODUCT_SELECT = "*, variants(*), category:categories(*)";

function sortVariants(p: Product): Product {
  return { ...p, variants: [...(p.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order) };
}

export const getSettings = cache(async (): Promise<StoreSettings> => {
  if (!isSupabaseConfigured) return DEMO_SETTINGS;
  const sb = createSupabasePublicClient();
  const { data, error } = await sb.from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) {
    console.error("getSettings", error);
    return DEMO_SETTINGS;
  }
  return { ...DEMO_SETTINGS, ...data } as StoreSettings;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return DEMO_CATEGORIES;
  const sb = createSupabasePublicClient();
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) {
    console.error("getCategories", error);
    return [];
  }
  return data as Category[];
});

export async function getProducts(opts: {
  categorySlug?: string;
  sort?: SortKey;
  q?: string;
  featured?: boolean;
  tag?: string;
  limit?: number;
} = {}): Promise<Product[]> {
  const { categorySlug, sort = "newest", q, featured, tag, limit } = opts;
  let list: Product[];

  if (!isSupabaseConfigured) {
    list = DEMO_PRODUCTS.filter((p) => p.active);
    if (categorySlug) list = list.filter((p) => p.category?.slug === categorySlug);
    if (featured) list = list.filter((p) => p.featured);
    if (tag) list = list.filter((p) => p.tags.includes(tag));
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.category?.name.toLowerCase().includes(needle),
      );
    }
  } else {
    const sb = createSupabasePublicClient();
    let query = sb.from("products").select(PRODUCT_SELECT).eq("active", true);
    if (categorySlug) {
      const cats = await getCategories();
      const cat = cats.find((c) => c.slug === categorySlug);
      if (!cat) return [];
      query = query.eq("category_id", cat.id);
    }
    if (featured) query = query.eq("featured", true);
    if (tag) query = query.contains("tags", [tag]);
    if (q) query = query.ilike("name", `%${q.replace(/[%_,()]/g, " ")}%`);
    const { data, error } = await query;
    if (error) {
      console.error("getProducts", error);
      return [];
    }
    list = (data ?? []) as Product[];
  }

  list = list.map(sortVariants);
  list.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "featured":
        return Number(b.featured) - Number(a.featured);
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });
  return limit ? list.slice(0, limit) : list;
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) {
    const p = DEMO_PRODUCTS.find((x) => x.slug === slug && x.active);
    return p ? sortVariants(p) : null;
  }
  const sb = createSupabasePublicClient();
  const { data, error } = await sb
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) console.error("getProductBySlug", error);
  return data ? sortVariants(data as Product) : null;
});

export interface OrderSummary {
  id: string;
  order_number: number;
  customer_name: string;
  total: number;
  payment_method: string;
  status: string;
  items: { product_name: string; variant_name: string | null; quantity: number; unit_price: number }[];
  subtotal: number;
  delivery_charge: number;
}

export async function getOrderSummary(id: string): Promise<OrderSummary | null> {
  if (!isSupabaseConfigured) return null;
  const sb = createSupabasePublicClient();
  const { data, error } = await sb.rpc("get_order_summary", { p_order_id: id });
  if (error) {
    console.error("getOrderSummary", error);
    return null;
  }
  return (data as OrderSummary | null) ?? null;
}
