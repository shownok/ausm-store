import type { Metadata } from "next";
import Link from "next/link";
import { ProductVisual } from "@/components/store/product-visual";
import { adminGetCategories, adminGetProducts } from "@/lib/admin";
import { taka } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage(props: PageProps<"/admin/products">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const [products, categories] = await Promise.all([adminGetProducts({ q, category }), adminGetCategories()]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products <span className="text-base font-normal text-navy/50">({products.length})</span></h1>
        <Link href="/admin/products/new" className="btn btn-primary py-2 text-sm">+ Add product</Link>
      </div>

      <form className="mt-5 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search by name" className="field max-w-xs" />
        <select name="category" defaultValue={category ?? ""} className="field max-w-xs">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn-dark py-2 text-sm">Filter</button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-navy/10 text-xs uppercase tracking-wider text-navy/50">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {products.map((p) => {
              const stock = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-sky/30">
                  <td className="p-4">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-medium hover:text-crimson">
                      <ProductVisual name={p.name} image={p.images[0]} sizes="40px" className="h-12 w-10 shrink-0 rounded-lg" />
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-4 text-navy/70">{p.category?.name}</td>
                  <td className="p-4">{taka(p.price)}</td>
                  <td className="p-4">
                    <span className={stock === 0 ? "font-semibold text-crimson" : ""}>{stock}</span>
                    <span className="text-navy/40"> · {p.variants.length} var.</span>
                  </td>
                  <td className="p-4">
                    {p.active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Live</span>
                    ) : (
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-700">Hidden</span>
                    )}
                    {p.featured && <span className="ml-1 rounded-full bg-sky px-2 py-0.5 text-xs font-semibold text-navy">Featured</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!products.length && <p className="p-8 text-center text-navy/55">No products found.</p>}
      </div>
    </div>
  );
}
