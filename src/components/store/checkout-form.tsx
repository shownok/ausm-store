"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder } from "@/app/(store)/checkout/actions";
import { useCart } from "@/components/cart/cart-context";
import { taka } from "@/lib/format";
import { deliveryCharge } from "@/lib/pricing";
import type { DeliveryZone, PaymentMethod, StoreSettings } from "@/lib/types";
import { ProductVisual } from "./product-visual";

export function CheckoutForm({ settings }: { settings: StoreSettings }) {
  const { lines, subtotal, ready, clear } = useCart();
  const router = useRouter();
  const [zone, setZone] = useState<DeliveryZone>("inside_dhaka");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const delivery = deliveryCharge(subtotal, zone, settings);
  const total = subtotal + delivery;

  if (!ready) return <div className="mt-10 h-96 animate-pulse rounded-2xl bg-sky" />;

  if (!lines.length) {
    return (
      <div className="mt-10 rounded-2xl bg-sky p-10 text-center">
        <p className="font-brush text-3xl text-crimson">Your cart is empty</p>
        <Link href="/shop" className="btn btn-dark mt-5">Continue shopping</Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => f.get(k)?.toString() ?? "";
    setError(null);
    startTransition(async () => {
      const res = await placeOrder({
        customer_name: get("customer_name"),
        phone: get("phone"),
        email: get("email"),
        address: get("address"),
        city: get("city"),
        zone,
        note: get("note"),
        payment_method: payment,
        payment_ref: get("payment_ref"),
        items: lines.map((l) => ({
          variant_id: l.variantId,
          quantity: l.quantity,
          name: l.name,
          variant: l.variantName,
          price: l.price,
        })),
      });
      if (!res.ok) {
        setError({ message: res.error, field: res.field });
        if (res.field) document.getElementsByName(res.field)[0]?.focus();
        return;
      }
      clear();
      router.push(
        res.demo
          ? `/order/demo?n=${res.orderNumber}&t=${res.total}`
          : `/order/${res.id}`,
      );
    });
  }

  const fieldErr = (name: string) => error?.field === name;
  const payNumber = payment === "bkash" ? settings.bkash_number : settings.nagad_number;

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]" noValidate>
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold">1. Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="customer_name">Full name *</label>
              <input id="customer_name" name="customer_name" autoComplete="name" required className={`field ${fieldErr("customer_name") ? "border-crimson" : ""}`} />
            </div>
            <div>
              <label className="label" htmlFor="phone">Mobile number *</label>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required className={`field ${fieldErr("phone") ? "border-crimson" : ""}`} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email (optional)</label>
              <input id="email" name="email" type="email" autoComplete="email" className="field" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">2. Delivery</h2>
          <div className="mb-4 grid grid-cols-2 gap-3">
            {(["inside_dhaka", "outside_dhaka"] as DeliveryZone[]).map((z) => (
              <label
                key={z}
                className={`cursor-pointer rounded-2xl border-[1.5px] p-4 ${zone === z ? "border-navy bg-sky" : "border-navy/15 bg-white"}`}
              >
                <input type="radio" name="zone" value={z} checked={zone === z} onChange={() => setZone(z)} className="sr-only" />
                <span className="block font-semibold">{z === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}</span>
                <span className="text-sm text-navy/60">
                  {taka(z === "inside_dhaka" ? settings.delivery_inside_dhaka : settings.delivery_outside_dhaka)} ·{" "}
                  {z === "inside_dhaka" ? "1–3 days" : "3–5 days"}
                </span>
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="address">Full address *</label>
              <textarea id="address" name="address" rows={2} autoComplete="street-address" placeholder="House, road, area" required className={`field ${fieldErr("address") ? "border-crimson" : ""}`} />
            </div>
            <div>
              <label className="label" htmlFor="city">City / district *</label>
              <input id="city" name="city" autoComplete="address-level2" defaultValue={zone === "inside_dhaka" ? "Dhaka" : ""} key={zone} required className={`field ${fieldErr("city") ? "border-crimson" : ""}`} />
            </div>
            <div>
              <label className="label" htmlFor="note">Order note (optional)</label>
              <input id="note" name="note" placeholder="e.g. call before delivery" className="field" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">3. Payment</h2>
          <div className="space-y-3">
            {([
              ["cod", "Cash on Delivery", "Pay the rider when your order arrives."],
              ["bkash", "bKash", "Send money first, then add the transaction ID."],
              ["nagad", "Nagad", "Send money first, then add the transaction ID."],
            ] as [PaymentMethod, string, string][]).map(([value, label, help]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border-[1.5px] p-4 ${payment === value ? "border-navy bg-sky" : "border-navy/15 bg-white"}`}
              >
                <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="mt-1 accent-[#25274d]" />
                <span>
                  <span className="block font-semibold">{label}</span>
                  <span className="text-sm text-navy/60">{help}</span>
                </span>
              </label>
            ))}
          </div>
          {payment !== "cod" && (
            <div className="mt-4 rounded-2xl border border-dashed border-navy/25 bg-white p-4">
              <p className="text-sm">
                Send <b>{taka(total)}</b> to our {payment === "bkash" ? "bKash" : "Nagad"} number{" "}
                <b className="whitespace-nowrap">{payNumber}</b> (Send Money), then enter the transaction ID below.
              </p>
              <label className="label mt-3" htmlFor="payment_ref">Transaction ID *</label>
              <input id="payment_ref" name="payment_ref" placeholder="e.g. 8N7A6B5C4D" className={`field ${fieldErr("payment_ref") ? "border-crimson" : ""}`} />
            </div>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/10 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 divide-y divide-navy/10">
          {lines.map((l) => (
            <li key={l.variantId} className="flex items-center gap-3 py-3">
              <div className="relative">
                <ProductVisual name={l.name} image={l.image} sizes="56px" className="h-16 w-14 rounded-lg" />
                <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">{l.quantity}</span>
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium leading-snug">{l.name}</p>
                {l.variantName !== "Standard" && <p className="text-navy/55">{l.variantName}</p>}
              </div>
              <span className="text-sm font-semibold">{taka(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-navy/10 pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{taka(subtotal)}</dd></div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{delivery === 0 ? <span className="font-semibold text-emerald-700">Free</span> : taka(delivery)}</dd>
          </div>
          <div className="flex justify-between border-t border-navy/10 pt-3 text-lg font-semibold">
            <dt>Total</dt><dd>{taka(total)}</dd>
          </div>
        </dl>
        {error && (
          <p className="mt-4 rounded-xl bg-crimson/10 p-3 text-sm font-medium text-crimson" role="alert">{error.message}</p>
        )}
        <button disabled={pending} className="btn btn-primary mt-5 w-full py-3.5 text-base">
          {pending ? "Placing order…" : `Place order · ${taka(total)}`}
        </button>
        <p className="mt-3 text-center text-xs text-navy/50">
          By placing an order you agree to our <Link href="/terms" className="underline">terms</Link>.
        </p>
      </aside>
    </form>
  );
}
