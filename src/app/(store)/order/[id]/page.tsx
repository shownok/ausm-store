import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderSummary, getSettings } from "@/lib/data";
import { PAYMENT_LABELS, taka, whatsappLink } from "@/lib/format";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderPage(props: PageProps<"/order/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const settings = await getSettings();

  let orderNumber: number;
  let total: number;
  let summary = null;

  if (id === "demo") {
    orderNumber = Number(sp.n) || 0;
    total = Number(sp.t) || 0;
  } else {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    summary = await getOrderSummary(id);
    if (!summary) notFound();
    orderNumber = summary.order_number;
    total = summary.total;
  }

  const waText = `Hi ausm! I just placed order #${orderNumber} (${taka(total)}). Please confirm.`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-crimson text-white">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
      </div>
      <p className="mt-6 font-brush text-4xl text-crimson">Thank you{summary ? `, ${summary.customer_name.split(" ")[0]}` : ""}!</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Order #{orderNumber} received</h1>
      <p className="mt-3 text-navy/70">
        We&apos;ll call or WhatsApp you shortly to confirm your order. Total: <b>{taka(total)}</b>
      </p>
      {id === "demo" && (
        <p className="mx-auto mt-4 max-w-md rounded-xl bg-amber-100 p-3 text-sm text-amber-900">
          Demo mode: this order was not saved. Connect Supabase to receive real orders.
        </p>
      )}

      {summary && (
        <div className="mt-8 rounded-2xl bg-white p-6 text-left ring-1 ring-navy/10">
          <ul className="divide-y divide-navy/10 text-sm">
            {summary.items.map((i, k) => (
              <li key={k} className="flex justify-between py-2">
                <span>
                  {i.product_name}
                  {i.variant_name && i.variant_name !== "Standard" ? ` (${i.variant_name})` : ""} × {i.quantity}
                </span>
                <span>{taka(i.unit_price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-navy/10 pt-3 text-sm">
            <div className="flex justify-between"><dt>Delivery</dt><dd>{taka(summary.delivery_charge)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{taka(summary.total)}</dd></div>
            <div className="flex justify-between text-navy/60"><dt>Payment</dt><dd>{PAYMENT_LABELS[summary.payment_method]}</dd></div>
          </dl>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={whatsappLink(settings.whatsapp, waText)} target="_blank" rel="noreferrer" className="btn bg-[#25d366] text-white hover:bg-[#1eb457]">
          Confirm on WhatsApp
        </a>
        <Link href="/shop" className="btn btn-outline text-navy">Keep shopping</Link>
      </div>
    </div>
  );
}
