import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/product-form";
import { adminGetCategories, adminGetProduct } from "@/lib/admin";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const [product, categories] = await Promise.all([adminGetProduct(id), adminGetCategories()]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-navy/60 hover:text-crimson">← Products</Link>
      <div className="mb-6 mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <Link href={`/product/${product.slug}`} target="_blank" className="text-sm font-medium text-crimson">View on store ↗</Link>
      </div>
      {sp.saved && <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">Product created.</p>}
      <ProductForm product={product} categories={categories} />
      <form action={deleteProduct} className="mt-10 border-t border-navy/10 pt-6">
        <input type="hidden" name="id" value={product.id} />
        <details>
          <summary className="cursor-pointer text-sm font-medium text-crimson">Delete this product…</summary>
          <p className="mt-2 text-sm text-navy/60">This removes the product and its variants. Past orders keep their item names and prices. To hide it temporarily, untick “Live on store” instead.</p>
          <button className="btn mt-3 bg-crimson py-2 text-sm text-white">Yes, delete permanently</button>
        </details>
      </form>
    </div>
  );
}
