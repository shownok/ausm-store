import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/store/buy-box";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductGrid } from "@/components/store/product-card";
import { getProductBySlug, getProducts, getSettings } from "@/lib/data";

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images[0] ? [product.images[0]] : undefined },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([
    getSettings(),
    getProducts({ categorySlug: product.category?.slug, limit: 5 }),
  ]);
  const others = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="text-sm text-navy/50" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-crimson">Home</Link> /{" "}
        <Link href="/shop" className="hover:text-crimson">Shop</Link>
        {product.category && (
          <>
            {" "}/{" "}
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-crimson">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <ProductGallery name={product.name} images={product.images} />
        <div>
          <BuyBox product={product} whatsapp={settings.whatsapp} />

          <div className="mt-10 divide-y divide-navy/10 border-y border-navy/10">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                Description <span className="transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-navy/75">{product.description}</p>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                Delivery &amp; payment <span className="transition group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-3 space-y-1.5 text-navy/75">
                <li>Inside Dhaka: ৳{settings.delivery_inside_dhaka} · 1–3 days</li>
                <li>Outside Dhaka: ৳{settings.delivery_outside_dhaka} · 3–5 days</li>
                {settings.free_delivery_over && <li>Free delivery on orders over ৳{settings.free_delivery_over.toLocaleString("en-IN")}</li>}
                <li>Cash on Delivery, bKash or Nagad</li>
              </ul>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                Exchange &amp; returns <span className="transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-navy/75">
                Exchange within 7 days of delivery if the item is unused with tags attached.{" "}
                <Link href="/delivery-returns" className="underline">Read the full policy</Link>.
              </p>
            </details>
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">You might also like</h2>
          <ProductGrid products={others} />
        </section>
      )}
    </div>
  );
}
