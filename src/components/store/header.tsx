"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import type { Category } from "@/lib/types";
import { CATEGORY_GROUPS } from "@/lib/types";

export function Header({ categories }: { categories: Category[] }) {
  const { count, ready, setDrawerOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const grouped = CATEGORY_GROUPS.map((g) => ({
    group: g,
    items: categories.filter((c) => c.group_name === g),
  })).filter((g) => g.items.length);

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button
          className="-ml-2 rounded-full p-2 md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-2" aria-label="ausm home">
          <Image src="/brand/logo-mark.png" alt="" width={34} height={34} priority />
          <Image src="/brand/logo-word.png" alt="ausm" width={78} height={19} priority className="h-[19px] w-auto" />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 text-[15px] font-medium md:flex">
          <Link href="/shop?tag=new" className="rounded-full px-3 py-2 hover:bg-sky">New in</Link>
          <div
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button
              className="flex items-center gap-1 rounded-full px-3 py-2 hover:bg-sky"
              aria-expanded={shopOpen}
              onClick={() => setShopOpen((v) => !v)}
            >
              Shop
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {shopOpen && (
              <div className="absolute left-0 top-full pt-2">
                <div className="grid w-[680px] grid-cols-4 gap-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-xl shadow-navy/10">
                  {grouped.map(({ group, items }) => (
                    <div key={group}>
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-crimson">{group}</p>
                      <ul className="space-y-2 text-sm">
                        {items.map((c) => (
                          <li key={c.id}>
                            <Link href={`/shop?category=${c.slug}`} onClick={() => setShopOpen(false)} className="text-navy/80 hover:text-crimson">
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Link href="/shop" onClick={() => setShopOpen(false)} className="col-span-4 border-t border-navy/10 pt-4 text-sm font-semibold text-navy hover:text-crimson">
                    Shop everything →
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link href="/shop?tag=bestseller" className="rounded-full px-3 py-2 hover:bg-sky">Bestsellers</Link>
          <Link href="/custom-studio" className="rounded-full px-3 py-2 hover:bg-sky">
            Custom Studio
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button className="rounded-full p-2 hover:bg-sky" aria-label="Search" onClick={() => setSearchOpen((v) => !v)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </button>
          <button
            className="relative rounded-full p-2 hover:bg-sky"
            aria-label={`Cart, ${count} items`}
            onClick={() => setDrawerOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
            {ready && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-crimson px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={onSearch} className="border-t border-navy/10 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-2xl gap-2">
            <input name="q" autoFocus placeholder="Search tees, caps, phone cases…" className="field" />
            <button className="btn btn-dark">Search</button>
          </div>
        </form>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-paper">
            <div className="flex items-center justify-between border-b border-navy/10 p-4">
              <Image src="/brand/logo-word.png" alt="ausm" width={78} height={19} className="h-[19px] w-auto" />
              <button aria-label="Close menu" className="rounded-full p-2" onClick={() => setMenuOpen(false)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <form onSubmit={onSearch} className="p-4">
              <input name="q" placeholder="Search products" className="field" />
            </form>
            <nav className="px-4 pb-8" onClick={(e) => (e.target as HTMLElement).closest("a") && setMenuOpen(false)}>
              <div className="mb-4 grid grid-cols-2 gap-2 text-sm font-semibold">
                <Link href="/shop?tag=new" className="rounded-xl bg-sky px-4 py-3">New in</Link>
                <Link href="/shop?tag=bestseller" className="rounded-xl bg-sky px-4 py-3">Bestsellers</Link>
                <Link href="/shop" className="rounded-xl bg-sky px-4 py-3">Shop all</Link>
                <Link href="/custom-studio" className="rounded-xl bg-crimson px-4 py-3 text-white">Custom Studio</Link>
              </div>
              {grouped.map(({ group, items }) => (
                <div key={group} className="border-t border-navy/10 py-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-crimson">{group}</p>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-[15px]">
                    {items.map((c) => (
                      <li key={c.id}>
                        <Link href={`/shop?category=${c.slug}`}>{c.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex gap-4 border-t border-navy/10 pt-4 text-sm text-navy/70">
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/delivery-returns">Delivery &amp; returns</Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
