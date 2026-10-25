"use client";

import Link from "next/link";
import { ProductVisual } from "@/components/store/product-visual";
import { taka } from "@/lib/format";
import { useCart } from "./cart-context";
import { QtyStepper } from "./cart-drawer";

export function CartView({ freeDeliveryOver }: { freeDeliveryOver: number | null }) {
  const { lines, subtotal, ready, setQuantity, remove } = useCart();

  if (!ready) return <div className="mt-8 h-64 animate-pulse rounded-2xl bg-sky" />;
  if (!lines.length) {
    return (
      <div className="mt-8 rounded-2xl bg-sky p-10 text-center">
        <p className="font-brush text-3xl text-crimson">Nothing in here yet</p>
        <Link href="/shop" className="btn btn-dark mt-5">Start shopping</Link>
      </div>
    );
  }

  const remaining = freeDeliveryOver ? freeDeliveryOver - subtotal : null;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <ul className="divide-y divide-navy/10 border-y border-navy/10">
        {lines.map((l) => (
          <li key={l.variantId} className="flex gap-4 py-5">
            <Link href={`/product/${l.slug}`}>
              <ProductVisual name={l.name} image={l.image} sizes="112px" className="h-32 w-24 rounded-xl sm:w-28" />
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-3">
                <div>
                  <Link href={`/product/${l.slug}`} className="font-medium hover:text-crimson">{l.name}</Link>
                  {l.variantName !== "Standard" && <p className="text-sm text-navy/60">{l.variantName}</p>}
                  <p className="mt-1 text-sm text-navy/60">{taka(l.price)} each</p>
                </div>
                <p className="font-semibold">{taka(l.price * l.quantity)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <QtyStepper value={l.quantity} onChange={(q) => setQuantity(l.variantId, q)} />
                <button className="text-sm text-navy/50 underline hover:text-crimson" onClick={() => remove(l.variantId)}>Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-3xl bg-white p-6 ring-1 ring-navy/10">
        <div className="flex justify-between text-lg">
          <span>Subtotal</span>
          <span className="font-semibold">{taka(subtotal)}</span>
        </div>
        {remaining !== null && (
          <p className="mt-3 rounded-xl bg-sky px-3 py-2 text-sm">
            {remaining > 0 ? <>Add <b>{taka(remaining)}</b> more for free delivery</> : <b>Free delivery unlocked</b>}
          </p>
        )}
        <p className="mt-3 text-sm text-navy/60">Delivery is calculated at checkout.</p>
        <Link href="/checkout" className="btn btn-primary mt-5 w-full py-3.5">Checkout</Link>
        <Link href="/shop" className="mt-3 block text-center text-sm font-medium underline">Continue shopping</Link>
      </aside>
    </div>
  );
}
