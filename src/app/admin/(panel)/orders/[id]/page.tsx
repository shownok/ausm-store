import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderForm } from "@/components/admin/order-form";
import { PrintButton } from "@/components/admin/print-button";
import { adminGetOrder } from "@/lib/admin";
import { getSettings } from "@/lib/data";
import { formatDate, PAYMENT_LABELS, STATUS_STYLES, taka, whatsappLink, ZONE_LABELS } from "@/lib/format";

export const metadata: Metadata = { title: "Order" };

export default async function OrderDetailPage(props: PageProps<"/admin/orders/[id]">) {
  const { id } = await props.params;
  const [order, settings] = await Promise.all([adminGetOrder(id), getSettings()]);
  if (!order) notFound();

  const intlPhone = "88" + order.phone;
  const waText = `Hi ${order.customer_name.split(" ")[0]}, this is ${settings.store_name}. We received your order #${order.order_number} (${taka(order.total)}). Can you confirm your delivery address: ${order.address}, ${order.city}?`;

  return (
    <div>
      <div className="print:hidden">
        <Link href="/admin/orders" className="text-sm text-navy/60 hover:text-crimson">← Orders</Link>
        <div className="mb-6 mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-3 text-2xl font-semibold">
            Order #{order.order_number}
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}>{order.status}</span>
          </h1>
          <div className="flex gap-2">
            <a href={whatsappLink(intlPhone, waText)} target="_blank" rel="noreferrer" className="btn bg-[#25d366] py-2 text-sm text-white">WhatsApp customer</a>
            <a href={`tel:${order.phone}`} className="btn bg-white py-2 text-sm text-navy">Call</a>
            <PrintButton />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Printable invoice / packing slip */}
        <section className="rounded-2xl bg-white p-6 shadow-sm print:shadow-none">
          <div className="flex items-start justify-between border-b border-navy/10 pb-4">
            <div>
              <p className="text-xl font-semibold">{settings.store_name}</p>
              <p className="text-xs text-navy/55">{settings.email} · +{settings.whatsapp}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">Invoice #{order.order_number}</p>
              <p className="text-navy/55">{formatDate(order.created_at)}</p>
            </div>
          </div>
          <div className="grid gap-4 border-b border-navy/10 py-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-navy/45">Deliver to</p>
              <p className="mt-1 font-semibold">{order.customer_name}</p>
              <p>{order.phone}</p>
              {order.email && <p>{order.email}</p>}
              <p className="mt-1">{order.address}</p>
              <p>{order.city} · {ZONE_LABELS[order.zone]}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-navy/45">Payment</p>
              <p className="mt-1 font-semibold">{PAYMENT_LABELS[order.payment_method]}</p>
              {order.payment_ref && <p>TrxID: <span className="font-mono">{order.payment_ref}</span></p>}
              <p className="mt-1">{order.payment_method === "cod" ? `Collect ${taka(order.total)} on delivery` : "Verify the transaction before shipping"}</p>
              {order.note && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-navy/45">Customer note</p>
                  <p>{order.note}</p>
                </>
              )}
            </div>
          </div>
          <table className="mt-2 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-navy/45">
              <tr><th className="py-2">Item</th><th className="py-2">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {order.items?.map((i) => (
                <tr key={i.id}>
                  <td className="py-2.5">{i.product_name}{i.variant_name && i.variant_name !== "Standard" && <span className="text-navy/55"> · {i.variant_name}</span>}</td>
                  <td className="py-2.5">{i.quantity}</td>
                  <td className="py-2.5 text-right">{taka(i.unit_price)}</td>
                  <td className="py-2.5 text-right">{taka(i.unit_price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="ml-auto mt-3 w-60 space-y-1 border-t border-navy/10 pt-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{taka(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{taka(order.delivery_charge)}</dd></div>
            <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{taka(order.total)}</dd></div>
          </dl>
        </section>

        <div className="print:hidden">
          <OrderForm order={order} />
        </div>
      </div>
    </div>
  );
}
