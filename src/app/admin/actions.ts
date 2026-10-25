"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminWriteClient } from "@/lib/admin";
import { slugify } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORY_GROUPS, ORDER_STATUSES, type OrderStatus } from "@/lib/types";

export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  /** variant ids after a product save, keyed by variant name */
  variantIds?: Record<string, string>;
} | null;

// ---------- Auth -------------------------------------------------------

export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) redirect("/admin");
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: "Wrong email or password." };
  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const sb = await createSupabaseServerClient();
    await sb.auth.signOut();
  }
  redirect("/admin/login");
}

function revalidateStore() {
  revalidatePath("/", "layout");
}

// ---------- Products ---------------------------------------------------

interface VariantInput {
  id?: string;
  name: string;
  sku?: string;
  price?: number | null;
  stock: number;
}

export async function saveProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  const { sb, error: demoError } = await adminWriteClient();
  if (!sb) return { error: demoError };

  const id = formData.get("id")?.toString() || null;
  const name = formData.get("name")?.toString().trim() ?? "";
  const slug = slugify(formData.get("slug")?.toString() || name);
  const price = Number(formData.get("price"));
  const compareRaw = formData.get("compare_at_price")?.toString();
  const compare = compareRaw ? Number(compareRaw) : null;
  const category_id = formData.get("category_id")?.toString() ?? "";

  if (!name) return { error: "Product name is required." };
  if (!slug) return { error: "URL slug is required." };
  if (!Number.isFinite(price) || price < 0) return { error: "Enter a valid price." };
  if (compare !== null && (!Number.isFinite(compare) || compare < 0)) return { error: "Enter a valid compare-at price." };
  if (!category_id) return { error: "Choose a category." };

  let variants: VariantInput[];
  let images: string[];
  try {
    variants = JSON.parse(formData.get("variants")?.toString() ?? "[]");
    images = JSON.parse(formData.get("images")?.toString() ?? "[]");
  } catch {
    return { error: "Couldn't read variants or images." };
  }
  variants = variants
    .map((v) => ({ ...v, name: v.name.trim(), stock: Math.max(0, Math.floor(Number(v.stock) || 0)) }))
    .filter((v) => v.name);
  if (!variants.length) return { error: "Add at least one variant (use “Standard” for one-size items)." };
  if (new Set(variants.map((v) => v.name.toLowerCase())).size !== variants.length) {
    return { error: "Variant names must be unique." };
  }

  const tags = (formData.get("tags")?.toString() ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const row = {
    name,
    slug,
    description: formData.get("description")?.toString() ?? "",
    category_id,
    price: Math.round(price),
    compare_at_price: compare !== null ? Math.round(compare) : null,
    images,
    tags,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  };

  let productId = id;
  if (id) {
    const { error } = await sb.from("products").update(row).eq("id", id);
    if (error) return { error: error.code === "23505" ? "That URL slug is already used by another product." : error.message };
  } else {
    const { data, error } = await sb.from("products").insert(row).select("id").single();
    if (error) return { error: error.code === "23505" ? "That URL slug is already used by another product." : error.message };
    productId = data.id;
  }

  // Sync variants: update existing, insert new, delete removed.
  const { data: existing } = await sb.from("variants").select("id").eq("product_id", productId!);
  const keepIds = new Set(variants.filter((v) => v.id).map((v) => v.id));
  const toDelete = (existing ?? []).map((v) => v.id).filter((vid) => !keepIds.has(vid));
  if (toDelete.length) {
    const { error } = await sb.from("variants").delete().in("id", toDelete);
    if (error) return { error: error.message };
  }
  const variantIds: Record<string, string> = {};
  for (const [i, v] of variants.entries()) {
    const vrow = {
      product_id: productId!,
      name: v.name,
      sku: v.sku?.trim() || null,
      price: v.price === null || v.price === undefined || Number.isNaN(Number(v.price)) ? null : Math.round(Number(v.price)),
      stock: v.stock,
      sort_order: i,
    };
    if (v.id) {
      const { error } = await sb.from("variants").update(vrow).eq("id", v.id);
      if (error) return { error: error.message };
      variantIds[v.name] = v.id;
    } else {
      const { data, error } = await sb.from("variants").insert(vrow).select("id").single();
      if (error) return { error: error.message };
      variantIds[v.name] = data.id;
    }
  }

  revalidateStore();
  if (!id) redirect(`/admin/products/${productId}?saved=1`);
  return { ok: true, message: "Saved.", variantIds };
}

export async function deleteProduct(formData: FormData) {
  const { sb } = await adminWriteClient();
  if (!sb) return;
  const id = formData.get("id")?.toString();
  if (!id) return;
  await sb.from("products").delete().eq("id", id);
  revalidateStore();
  redirect("/admin/products");
}

// ---------- Orders -----------------------------------------------------

export async function updateOrder(_: ActionState, formData: FormData): Promise<ActionState> {
  const { sb, error: demoError } = await adminWriteClient();
  if (!sb) return { error: demoError };
  const id = formData.get("id")?.toString() ?? "";
  const status = formData.get("status")?.toString() as OrderStatus;
  const admin_note = formData.get("admin_note")?.toString().trim() || null;
  if (!ORDER_STATUSES.includes(status)) return { error: "Invalid status." };

  const { data: current, error: readErr } = await sb.from("orders").select("status").eq("id", id).single();
  if (readErr) return { error: readErr.message };

  const { error } = await sb.from("orders").update({ status, admin_note }).eq("id", id);
  if (error) return { error: error.message };

  const wasActive = !["cancelled", "returned"].includes(current.status);
  const nowInactive = ["cancelled", "returned"].includes(status);
  let message = "Order updated.";
  if (wasActive && nowInactive) {
    const { error: rErr } = await sb.rpc("restock_order", { p_order_id: id });
    message = rErr ? `Updated, but restocking failed: ${rErr.message}` : "Order updated and items returned to stock.";
  }
  revalidatePath("/admin", "layout");
  revalidateStore();
  return { ok: true, message };
}

// ---------- Categories -------------------------------------------------

export async function saveCategory(_: ActionState, formData: FormData): Promise<ActionState> {
  const { sb, error: demoError } = await adminWriteClient();
  if (!sb) return { error: demoError };
  const id = formData.get("id")?.toString() || null;
  const name = formData.get("name")?.toString().trim() ?? "";
  const group_name = formData.get("group_name")?.toString() ?? "";
  if (!name) return { error: "Name is required." };
  if (!CATEGORY_GROUPS.includes(group_name as never)) return { error: "Choose a group." };
  const row = {
    name,
    slug: slugify(formData.get("slug")?.toString() || name),
    group_name,
    sort_order: Number(formData.get("sort_order")) || 0,
    active: formData.get("active") === "on",
  };
  const { error } = id
    ? await sb.from("categories").update(row).eq("id", id)
    : await sb.from("categories").insert(row);
  if (error) return { error: error.code === "23505" ? "That slug is already used." : error.message };
  revalidatePath("/admin/categories");
  revalidateStore();
  return { ok: true, message: id ? "Category updated." : "Category added." };
}

export async function deleteCategory(_: ActionState, formData: FormData): Promise<ActionState> {
  const { sb, error: demoError } = await adminWriteClient();
  if (!sb) return { error: demoError };
  const id = formData.get("id")?.toString() ?? "";
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) {
    return {
      error: error.code === "23503" ? "This category still has products. Move or delete them first, or hide the category." : error.message,
    };
  }
  revalidatePath("/admin/categories");
  revalidateStore();
  return { ok: true, message: "Category deleted." };
}

// ---------- Settings ---------------------------------------------------

export async function saveSettings(_: ActionState, formData: FormData): Promise<ActionState> {
  const { sb, error: demoError } = await adminWriteClient();
  if (!sb) return { error: demoError };
  const num = (k: string) => Math.max(0, Math.round(Number(formData.get(k)) || 0));
  const free = formData.get("free_delivery_over")?.toString().trim();
  const row = {
    store_name: formData.get("store_name")?.toString().trim() || "ausm",
    whatsapp: (formData.get("whatsapp")?.toString() ?? "").replace(/[^\d]/g, ""),
    email: formData.get("email")?.toString().trim() ?? "",
    bkash_number: formData.get("bkash_number")?.toString().trim() ?? "",
    nagad_number: formData.get("nagad_number")?.toString().trim() ?? "",
    delivery_inside_dhaka: num("delivery_inside_dhaka"),
    delivery_outside_dhaka: num("delivery_outside_dhaka"),
    free_delivery_over: free ? Math.round(Number(free)) || null : null,
    announcement: formData.get("announcement")?.toString().trim() ?? "",
  };
  const { error } = await sb.from("store_settings").update(row).eq("id", 1);
  if (error) return { error: error.message };
  revalidateStore();
  return { ok: true, message: "Settings saved." };
}
