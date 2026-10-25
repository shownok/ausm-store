import Image from "next/image";
import Link from "next/link";
import { whatsappLink } from "@/lib/format";
import type { Category, StoreSettings } from "@/lib/types";

export function Footer({ settings, categories }: { settings: StoreSettings; categories: Category[] }) {
  return (
    <footer className="mt-24 bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky p-2">
              <Image src="/brand/logo-mark.png" alt="" width={36} height={36} />
            </div>
            <p className="font-brush text-3xl text-sky">The art of life</p>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Fashion and lifestyle pieces made for everyday self-expression. Designed in Bangladesh.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="https://www.instagram.com/ausmbd/" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-2.5 hover:bg-crimson">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
            </a>
            <a href="https://www.facebook.com/ausmbd/" target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-2.5 hover:bg-crimson">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8z" /></svg>
            </a>
            <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full bg-white/10 p-2.5 hover:bg-crimson">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a15 15 0 0 1-6.3-5.5c-.5-.7-1-1.7-1-2.7s.5-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.6-.3.4c.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.1l.5-.1.7-.9c.2-.2.3-.2.5-.1l1.9.9c.3.1.4.2.5.3.1.2.1.7-.1 1.4z" /></svg>
            </a>
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-sky/70">Shop</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/shop?tag=new" className="hover:text-white">New in</Link></li>
            <li><Link href="/shop?tag=bestseller" className="hover:text-white">Bestsellers</Link></li>
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}><Link href={`/shop?category=${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
            <li><Link href="/shop" className="hover:text-white">Shop all</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-sky/70">Help</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/delivery-returns" className="hover:text-white">Delivery &amp; returns</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
            <li><Link href="/custom-studio" className="hover:text-white">Custom Studio</Link></li>
            <li><Link href="/about" className="hover:text-white">About ausm</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-sky/70">We accept</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-md bg-white/10 px-2.5 py-1.5">Cash on Delivery</span>
            <span className="rounded-md bg-[#e2136e] px-2.5 py-1.5">bKash</span>
            <span className="rounded-md bg-[#f6921e] px-2.5 py-1.5">Nagad</span>
          </div>
          <p className="mt-5 text-sm text-white/70">{settings.email}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 py-5 text-xs text-white/50 sm:px-6">
          <p>© {new Date().getFullYear()} ausm. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
