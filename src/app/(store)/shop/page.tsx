import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/store/product-card";
import { SortSelect } from "@/components/store/sort-select";
import { getCategories, getProducts, type SortKey } from "@/lib/data";
import { CATEGORY_GROUPS } from "@/lib/types";

const SORTS: SortKey[] = ["newest", "price-asc", "price-desc", "featured"];

export async function generateMetadata(props: PageProps<"/shop">): Promise<Metadata> {
  const sp = await props.searchParams;
  const slug = typeof sp.category === "string" ? sp.category : undefined;
  if (!slug) return { title: "Shop all" };
  const cat = (await getCategories()).find((c) => c.slug === slug);
  return { title: cat?.name ?? "Shop" };
}

export default async function ShopPage(props: PageProps<"/shop">) {
  const sp = await props.searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const categorySlug = str(sp.category);
  const q = str(sp.q)?.slice(0, 80);
  const tag = str(sp.tag);
  const sortRaw = str(sp.sort) as SortKey | undefined;
  const sort = sortRaw && SORTS.includes(sortRaw) ? sortRaw : "newest";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug, q, tag, sort }),
  ]);
  const current = categories.find((c) => c.slug === categorySlug);

  const title = current
    ? current.name
    : q
      ? `Results for “${q}”`
      : tag === "new"
        ? "New in"
        : tag === "bestseller"
          ? "Bestsellers"
          : "Shop all";

  const href = (params: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && u.set(k, v));
    const s = u.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-navy/50" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-crimson">Home</Link> /{" "}
        <Link href="/shop" className="hover:text-crimson">Shop</Link>
        {current && <> / <span className="text-navy">{current.name}</span></>}
      </nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-navy/60">{products.length} products</p>
        </div>
        <SortSelect value={sort} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          {/* Mobile: horizontal chips */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden">
            <Link
              href={href({ sort: sortRaw })}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${!current ? "bg-navy text-white" : "bg-sky text-navy"}`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={href({ category: c.slug, sort: sortRaw })}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${current?.id === c.id ? "bg-navy text-white" : "bg-sky text-navy"}`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Desktop: grouped list */}
          <div className="sticky top-24 hidden space-y-6 lg:block">
            <Link href={href({ sort: sortRaw })} className={`block text-sm font-semibold ${!current && !tag && !q ? "text-crimson" : "text-navy hover:text-crimson"}`}>
              All products
            </Link>
            {CATEGORY_GROUPS.map((group) => {
              const cats = categories.filter((c) => c.group_name === group);
              if (!cats.length) return null;
              return (
                <div key={group}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-navy/40">{group}</p>
                  <ul className="space-y-1.5 text-[15px]">
                    {cats.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={href({ category: c.slug, sort: sortRaw })}
                          className={current?.id === c.id ? "font-semibold text-crimson" : "text-navy/75 hover:text-crimson"}
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        <div>
          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <div className="rounded-2xl bg-sky p-10 text-center">
              <p className="font-brush text-3xl text-crimson">Nothing here yet</p>
              <p className="mt-2 text-navy/70">Try another category or search term.</p>
              <Link href="/shop" className="btn btn-dark mt-5">Shop all</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
