import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/store/product-card";
import { ProductVisual } from "@/components/store/product-visual";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { taka } from "@/lib/format";
import { CATEGORY_GROUPS } from "@/lib/types";

const GROUP_COPY: Record<string, { line: string; bg: string; fg: string }> = {
  Fashion: { line: "Tees, hoodies, bottoms & footwear", bg: "bg-crimson", fg: "text-white" },
  Accessories: { line: "Caps, bags, watches & shades", bg: "bg-navy", fg: "text-white" },
  Lifestyle: { line: "Drinkware, desk & gifting", bg: "bg-sky", fg: "text-navy" },
  "Phone & Tech": { line: "Cases & everyday tech", bg: "bg-[#f6e6ec]", fg: "text-navy" },
};

export default async function HomePage() {
  const [categories, featured, newIn, bestsellers, settings] = await Promise.all([
    getCategories(),
    getProducts({ featured: true, limit: 3 }),
    getProducts({ sort: "newest", limit: 8 }),
    getProducts({ tag: "bestseller", limit: 4 }),
    getSettings(),
  ]);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-sky">
        <div className="absolute inset-0 grain" />
        <div className="relative mx-auto grid max-w-7xl md:min-h-[560px] md:grid-cols-2">
          <div className="diag-cut relative z-10 flex flex-col justify-center bg-ember px-6 py-16 text-white sm:px-10 md:py-20 md:pr-28">
            <p className="font-brush text-4xl text-sky sm:text-5xl">The art of life</p>
            <h1 className="mt-3 max-w-md text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Wear what makes you, you.
            </h1>
            <p className="mt-5 max-w-sm text-white/80">
              Everyday fashion and lifestyle pieces, designed in Bangladesh. Cash on Delivery nationwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop?tag=new" className="btn bg-white text-ember hover:bg-sky">Shop new in</Link>
              <Link href="/shop" className="btn btn-outline text-white hover:bg-white/10">Browse all</Link>
            </div>
          </div>

          <div className="relative hidden items-center justify-center gap-4 p-10 md:flex">
            {featured.map((p, i) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className={`group block w-[34%] shrink-0 ${i === 1 ? "-translate-y-8" : "translate-y-6"}`}
              >
                <ProductVisual
                  name={p.name}
                  image={p.images[0]}
                  priority
                  sizes="220px"
                  className="aspect-[3/4] rounded-2xl shadow-xl shadow-navy/15 transition group-hover:-translate-y-1"
                />
                <p className="mt-2 truncate text-sm font-medium text-navy">{p.name}</p>
                <p className="text-sm font-semibold text-crimson">{taka(p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Shop by group ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Shop by category</h2>
          <Link href="/shop" className="text-sm font-semibold text-crimson hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORY_GROUPS.map((group) => {
            const cats = categories.filter((c) => c.group_name === group);
            if (!cats.length) return null;
            const copy = GROUP_COPY[group];
            return (
              <div key={group} className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 ${copy.bg} ${copy.fg}`}>
                <Image src="/brand/logo-mark.png" alt="" width={120} height={120} className="pointer-events-none absolute -bottom-6 -right-6 opacity-15" />
                <h3 className="text-xl font-semibold sm:text-2xl">{group}</h3>
                <p className="mt-1 text-sm opacity-75">{copy.line}</p>
                <ul className="relative mt-5 flex flex-wrap gap-1.5">
                  {cats.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/shop?category=${c.slug}`}
                        className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-navy hover:bg-white"
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
      </section>

      {/* ---------- New in ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-brush text-2xl text-crimson">Fresh drop</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">New in</h2>
          </div>
          <Link href="/shop?sort=newest" className="text-sm font-semibold text-crimson hover:underline">Shop new</Link>
        </div>
        <ProductGrid products={newIn} />
      </section>

      {/* ---------- Custom Studio ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Link href="/custom-studio" className="group relative block overflow-hidden rounded-3xl">
          <Image
            src="/brand/custom-studio-banner.jpg"
            alt="A red ausm tee with a custom printed phone case"
            width={1556}
            height={592}
            className="h-[300px] w-full object-cover object-right transition duration-500 group-hover:scale-[1.02] sm:h-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/30 to-transparent sm:from-transparent sm:via-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-[60%] flex-col justify-end p-6 sm:hidden">
            <p className="font-brush text-4xl leading-none text-white">Design your imagination</p>
            <span className="mt-3 text-sm font-semibold text-sky">Custom Studio →</span>
          </div>
          <span className="absolute bottom-6 right-6 hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy shadow-lg sm:inline-block">
            Explore Custom Studio →
          </span>
        </Link>
      </section>

      {/* ---------- Bestsellers ---------- */}
      {bestsellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bestsellers</h2>
            <Link href="/shop?tag=bestseller" className="text-sm font-semibold text-crimson hover:underline">See all</Link>
          </div>
          <ProductGrid products={bestsellers} />
        </section>
      )}

      {/* ---------- Trust strip ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="grid gap-px overflow-hidden rounded-2xl bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Cash on Delivery", "Pay when it reaches you, anywhere in Bangladesh."],
            [
              "Fast delivery",
              `Inside Dhaka ${taka(settings.delivery_inside_dhaka)}, outside ${taka(settings.delivery_outside_dhaka)}.`,
            ],
            ["Easy exchange", "Wrong size? Exchange within 7 days of delivery."],
            ["bKash & Nagad", "Prefer to pay ahead? Send money and add your transaction ID."],
          ].map(([title, body]) => (
            <div key={title} className="bg-paper p-6">
              <p className="font-semibold text-navy">{title}</p>
              <p className="mt-1 text-sm text-navy/65">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Instagram ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-sky px-6 py-12 text-center">
          <p className="font-brush text-4xl text-crimson sm:text-5xl">you are ausm</p>
          <p className="max-w-md text-navy/75">
            Tag <b>@ausmbd</b> in your fits for a chance to be featured on our page.
          </p>
          <a href="https://www.instagram.com/ausmbd/" target="_blank" rel="noreferrer" className="btn btn-dark">
            Follow @ausmbd
          </a>
        </div>
      </section>
    </>
  );
}
