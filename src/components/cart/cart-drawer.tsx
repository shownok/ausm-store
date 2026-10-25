"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ProductVisual } from "@/components/store/product-visual";
import { taka } from "@/lib/format";
import { useCart } from "./cart-context";

export function CartDrawer({ freeDeliveryOver }: { freeDeliveryOver: number | null }) {
  const { lines, subtotal, drawerOpen, setDrawerOpen, setQuantity, remove } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;
  const remaining = freeDeliveryOver ? freeDeliveryOver - subtotal : null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-navy/40" onClick={() => setDrawerOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button className="rounded-full p-2 hover:bg-sky" aria-label="Close cart" onClick={() => setDrawerOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="font-brush text-4xl text-crimson">Empty for now</p>
            <p className="text-navy/70">Find something you love.</p>
            <Link href="/shop" className="btn btn-dark" onClick={() => setDrawerOpen(false)}>Start shopping</Link>
          </div>
        ) : (
          <>
            {remaining !== null && (
              <div className="border-b border-navy/10 bg-sky px-5 py-3 text-sm">
                {remaining > 0 ? (
                  <>Add <b>{taka(remaining)}</b> more for free delivery</>
                ) : (
                  <b>You&apos;ve unlocked free delivery 🎉</b>
                )}
              </div>
            )}
            <ul className="flex-1 divide-y divide-navy/10 overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.variantId} className="flex gap-4 py-4">
                  <ProductVisual sizes="80px" name={l.name} image={l.image} className="h-24 w-20 shrink-0 rounded-xl" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link href={`/product/${l.slug}`} onClick={() => setDrawerOpen(false)} className="font-medium leading-snug hover:text-crimson">
                        {l.name}
                      </Link>
                      <span className="font-semibold">{taka(l.price * l.quantity)}</span>
                    </div>
                    {l.variantName !== "Standard" && <p className="text-sm text-navy/60">{l.variantName}</p>}
                    <div className="mt-auto flex items-center justify-between">
                      <QtyStepper value={l.quantity} onChange={(q) => setQuantity(l.variantId, q)} />
                      <button className="text-sm text-navy/50 underline hover:text-crimson" onClick={() => remove(l.variantId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-navy/10 p-5">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span className="font-semibold">{taka(subtotal)}</span>
              </div>
              <p className="text-sm text-navy/60">Delivery charge is calculated at checkout.</p>
              <Link href="/checkout" onClick={() => setDrawerOpen(false)} className="btn btn-primary w-full">
                Checkout
              </Link>
              <Link href="/cart" onClick={() => setDrawerOpen(false)} className="block text-center text-sm font-medium underline">
                View cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function QtyStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-navy/15 bg-white">
      <button type="button" className="h-8 w-8 rounded-full text-lg hover:bg-sky" aria-label="Decrease quantity" onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="w-7 text-center text-sm font-semibold" aria-live="polite">{value}</span>
      <button type="button" className="h-8 w-8 rounded-full text-lg hover:bg-sky disabled:opacity-40" aria-label="Increase quantity" disabled={value >= 20} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
