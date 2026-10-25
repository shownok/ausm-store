import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>
      <p className="mt-1 text-navy/60">No account needed. We&apos;ll call or WhatsApp you to confirm.</p>
      <CheckoutForm settings={settings} />
    </div>
  );
}
