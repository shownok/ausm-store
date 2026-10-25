"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { QtyStepper } from "@/components/cart/cart-drawer";
import { taka, whatsappLink } from "@/lib/format";
import type { Product } from "@/lib/types";

export function BuyBox({ product, whatsapp }: { product: Product; whatsapp: string }) {
  const { add } = useCart();
  const variants = product.variants;
  const single = variants.length === 1;
  const firstAvailable = variants.find((v) => v.stock > 0);
  const [variantId, setVariantId] = useState<string | null>(
    single ? (variants[0]?.id ?? null) : (firstAvailable?.id ?? null),
  );
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const variant = variants.find((v) => v.id === variantId) ?? null;
  const price = variant?.price ?? product.price;
  const soldOut = !variants.some((v) => v.stock > 0);
  const onSale = product.compare_at_price && product.compare_at_price > price;
  const isPhone = product.category?.slug === "phone-cases";
  const optionLabel = isPhone ? "Phone model" : "Size";

  function addToCart() {
    if (!variant) {
      setError(`Please choose a ${optionLabel.toLowerCase()}.`);
      return;
    }
    if (variant.stock < qty) {
      setError(`Only ${variant.stock} left in this option.`);
      return;
    }
    setError(null);
    add(
      {
        productId: product.id,
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        variantName: variant.name,
        price,
        image: product.images[0] ?? null,
        categorySlug: product.category?.slug ?? "",
      },
      qty,
    );
  }

  const waText = `Hi ausm! I'd like to order:\n${product.name}${variant && variant.name !== "Standard" ? ` (${variant.name})` : ""} × ${qty}\nPrice: ${taka(price)}`;

  return (
    <div>
      {product.category && (
        <p className="text-sm font-semibold uppercase tracking-widest text-crimson">{product.category.name}</p>
      )}
      <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
      <p className="mt-3 flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-navy">{taka(price)}</span>
        {onSale && <span className="text-lg text-navy/40 line-through">{taka(product.compare_at_price!)}</span>}
        {onSale && (
          <span className="rounded-full bg-crimson/10 px-2.5 py-0.5 text-sm font-semibold text-crimson">
            Save {taka(product.compare_at_price! - price)}
          </span>
        )}
      </p>

      {!single && (
        <fieldset className="mt-7">
          <legend className="mb-3 flex w-full justify-between text-sm font-semibold">
            <span>
              {optionLabel}
              {variant && <span className="ml-2 font-normal text-navy/60">{variant.name}</span>}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const out = v.stock <= 0;
              const selected = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setVariantId(v.id);
                    setError(null);
                  }}
                  aria-pressed={selected}
                  className={`min-w-14 rounded-full border-[1.5px] px-4 py-2.5 text-sm font-medium transition ${
                    selected
                      ? "border-navy bg-navy text-white"
                      : out
                        ? "cursor-not-allowed border-navy/10 text-navy/30 line-through"
                        : "border-navy/20 bg-white hover:border-navy"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {variant && variant.stock > 0 && variant.stock <= 5 && (
        <p className="mt-4 text-sm font-semibold text-crimson">Only {variant.stock} left</p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {!soldOut && <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} />}
        <button type="button" onClick={addToCart} disabled={soldOut} className="btn btn-primary flex-1 py-3.5 text-base">
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-crimson" role="alert">{error}</p>}

      <a
        href={whatsappLink(whatsapp, waText)}
        target="_blank"
        rel="noreferrer"
        className="btn btn-outline mt-3 w-full border-[#25d366] text-[#128c4b] hover:bg-[#25d366]/10"
      >
        Order on WhatsApp
      </a>

      <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-navy/70">
        <li className="rounded-xl bg-sky px-2 py-3">Cash on Delivery</li>
        <li className="rounded-xl bg-sky px-2 py-3">7-day exchange</li>
        <li className="rounded-xl bg-sky px-2 py-3">Nationwide delivery</li>
      </ul>
    </div>
  );
}
