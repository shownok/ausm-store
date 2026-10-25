import Link from "next/link";
import { taka } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductVisual } from "./product-visual";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const inStock = product.variants.some((v) => v.stock > 0);
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const discount = onSale
    ? Math.round(100 - (product.price / product.compare_at_price!) * 100)
    : 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative">
        <ProductVisual
          name={product.name}
          image={product.images[0]}
          label={product.category?.name}
          priority={priority}
          className="aspect-[4/5] rounded-2xl transition-transform duration-300 group-hover:-translate-y-1"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.tags.includes("new") && (
            <span className="rounded-full bg-navy px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">New</span>
          )}
          {onSale && (
            <span className="rounded-full bg-crimson px-2.5 py-1 text-[11px] font-bold text-white">-{discount}%</span>
          )}
        </div>
        {!inStock && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/60">
            <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold uppercase text-white">Sold out</span>
          </div>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="text-[15px] font-medium leading-snug text-ink group-hover:text-crimson">{product.name}</h3>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold text-navy">{taka(product.price)}</span>
          {onSale && <span className="text-sm text-navy/40 line-through">{taka(product.compare_at_price!)}</span>}
        </p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
