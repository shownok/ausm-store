import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your cart</h1>
      <CartView freeDeliveryOver={settings.free_delivery_over} />
    </div>
  );
}
