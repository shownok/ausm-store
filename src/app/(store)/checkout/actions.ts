"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { DEMO_PRODUCTS, DEMO_SETTINGS } from "@/lib/demo-data";
import { normalizeBdPhone } from "@/lib/format";
import { notifyNewOrder } from "@/lib/notify";
import { deliveryCharge } from "@/lib/pricing";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { DeliveryZone, PaymentMethod } from "@/lib/types";

export interface CheckoutInput {
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  zone: DeliveryZone;
  note?: string;
  payment_method: PaymentMethod;
  payment_ref?: string;
  items: { variant_id: string; quantity: number; name: string; variant: string; price: number }[];
}

export type CheckoutResult =
  | { ok: true; id: string; orderNumber: number; total: number; demo: boolean }
  | { ok: false; error: string; field?: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = input.customer_name?.trim();
  const phone = normalizeBdPhone(input.phone ?? "");
  const address = input.address?.trim();
  const city = input.city?.trim();

  if (!name) return { ok: false, error: "Please enter your name.", field: "customer_name" };
  if (!phone) return { ok: false, error: "Enter a valid Bangladeshi mobile number (01XXXXXXXXX).", field: "phone" };
  if (!address || address.length < 8) return { ok: false, error: "Please enter your full address.", field: "address" };
  if (!city) return { ok: false, error: "Please enter your city or district.", field: "city" };
  if (!["inside_dhaka", "outside_dhaka"].includes(input.zone)) return { ok: false, error: "Choose a delivery area.", field: "zone" };
  if (!["cod", "bkash", "nagad"].includes(input.payment_method)) return { ok: false, error: "Choose a payment method." };
  if (input.payment_method !== "cod" && !input.payment_ref?.trim()) {
    return { ok: false, error: "Please add the transaction ID from your bKash/Nagad payment.", field: "payment_ref" };
  }
  const items = (input.items ?? []).filter((i) => i.quantity > 0);
  if (!items.length) return { ok: false, error: "Your cart is empty." };

  const payload = {
    customer_name: name,
    phone,
    email: input.email?.trim() || null,
    address,
    city,
    zone: input.zone,
    note: input.note?.trim() || null,
    payment_method: input.payment_method,
    payment_ref: input.payment_ref?.trim() || null,
    items: items.map((i) => ({ variant_id: i.variant_id, quantity: Math.floor(i.quantity) })),
  };

  let id: string;
  let orderNumber: number;
  let total: number;

  if (!isSupabaseConfigured) {
    // Demo mode: validate against the placeholder catalog, but don't save anything.
    let subtotal = 0;
    for (const item of items) {
      const product = DEMO_PRODUCTS.find((p) => p.variants.some((v) => v.id === item.variant_id));
      const variant = product?.variants.find((v) => v.id === item.variant_id);
      if (!product || !variant) return { ok: false, error: "An item in your cart is no longer available." };
      if (variant.stock < item.quantity) return { ok: false, error: `${product.name} (${variant.name}) is out of stock.` };
      subtotal += (variant.price ?? product.price) * item.quantity;
    }
    total = subtotal + deliveryCharge(subtotal, input.zone, DEMO_SETTINGS);
    orderNumber = 1000 + Math.floor(Math.random() * 9000);
    id = "demo";
  } else {
    const sb = createSupabasePublicClient();
    const { data, error } = await sb.rpc("place_order", { payload });
    if (error) {
      const msg = error.message ?? "";
      if (msg.includes("OUT_OF_STOCK")) {
        const what = msg.split("OUT_OF_STOCK:")[1]?.trim();
        return { ok: false, error: `Sorry, ${what || "an item"} just sold out. Please update your cart.` };
      }
      if (msg.includes("ITEM_NOT_FOUND")) return { ok: false, error: "An item in your cart is no longer available. Please update your cart." };
      console.error("place_order", error);
      return { ok: false, error: "We couldn't place your order. Please try again or order on WhatsApp." };
    }
    const result = data as { id: string; order_number: number; total: number };
    id = result.id;
    orderNumber = result.order_number;
    total = result.total;
  }

  // Stock changed, so refresh cached store pages.
  if (isSupabaseConfigured) revalidatePath("/", "layout");

  after(() =>
    notifyNewOrder({
      orderNumber,
      total,
      customerName: name,
      phone,
      address,
      city,
      zone: input.zone,
      paymentMethod: input.payment_method,
      paymentRef: payload.payment_ref ?? undefined,
      note: payload.note ?? undefined,
      items: items.map((i) => ({ name: i.name, variant: i.variant, quantity: i.quantity, price: i.price })),
    }),
  );

  return { ok: true, id, orderNumber, total, demo: !isSupabaseConfigured };
}
