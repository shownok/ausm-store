import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-context";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { getCategories, getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Re-check products, stock and settings at least every minute.
export const revalidate = 60;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <CartProvider>
      {!isSupabaseConfigured && (
        <div className="bg-amber-300 px-4 py-1.5 text-center text-xs font-semibold text-amber-950">
          Demo mode: placeholder products, and orders are not saved. Connect Supabase to go live (see README).
        </div>
      )}
      {settings.announcement && (
        <div className="bg-navy px-4 py-2 text-center text-[13px] font-medium text-sky">
          {settings.announcement}
        </div>
      )}
      <Header categories={categories} />
      <main>{children}</main>
      <Footer settings={settings} categories={categories} />
      <CartDrawer freeDeliveryOver={settings.free_delivery_over} />
      <a
        href={whatsappLink(settings.whatsapp, "Hi ausm! I have a question.")}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a15 15 0 0 1-6.3-5.5c-.5-.7-1-1.7-1-2.7s.5-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.6-.3.4c.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.1l.5-.1.7-.9c.2-.2.3-.2.5-.1l1.9.9c.3.1.4.2.5.3.1.2.1.7-.1 1.4z" /></svg>
      </a>
    </CartProvider>
  );
}
