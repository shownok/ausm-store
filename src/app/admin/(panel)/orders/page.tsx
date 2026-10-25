import type { Metadata } from "next";
import Link from "next/link";
import { adminGetOrders } from "@/lib/admin";
import { formatDate, PAYMENT_LABELS, STATUS_STYLES, taka, ZONE_LABELS } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage(props: PageProps<"/admin/orders">) {
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" && sp.status ? sp.status : undefined;
  const q = typeof sp.q === "string" && sp.q ? sp.q : undefined;
  const page = Number(sp.page) || 1;
  const { orders, total, pageSize } = await adminGetOrders({ status, q, page });
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const link = (params: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    Object.entries({ status, q, ...params }).forEach(([k, v]) => v && u.set(k, String(v)));
    return `/admin/orders?${u}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders <span className="text-base font-normal text-navy/50">({total})</span></h1>

      <div className="mt-5 flex flex-wrap gap-1.5">
        <Link href={link({ status: undefined, page: undefined })} className={`rounded-full px-3 py-1.5 text-sm font-medium ${!status ? "bg-navy text-white" : "bg-white text-navy"}`}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={link({ status: s, page: undefined })} className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${status === s ? "bg-navy text-white" : "bg-white text-navy"}`}>
            {s}
          </Link>
        ))}
      </div>

      <form className="mt-3 flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Order #, phone or name" className="field max-w-xs" />
        <button className="btn btn-dark py-2 text-sm">Search</button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-navy/10 text-xs uppercase tracking-wider text-navy/50">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Area</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-sky/30">
                <td className="p-4">
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:text-crimson">#{o.order_number}</Link>
                  <p className="text-xs text-navy/50">{formatDate(o.created_at)}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">{o.customer_name}</p>
                  <p className="text-xs text-navy/55">{o.phone}</p>
                </td>
                <td className="p-4 text-navy/70">{o.city}<p className="text-xs text-navy/45">{ZONE_LABELS[o.zone]}</p></td>
                <td className="p-4 text-navy/70">{PAYMENT_LABELS[o.payment_method]}{o.payment_ref && <p className="text-xs text-navy/45">{o.payment_ref}</p>}</td>
                <td className="p-4 font-semibold">{taka(o.total)}</td>
                <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className="p-8 text-center text-navy/55">No orders found.</p>}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={link({ page: page - 1 })} className="btn bg-white py-2">← Newer</Link>}
          <span className="text-navy/60">Page {page} of {pages}</span>
          {page < pages && <Link href={link({ page: page + 1 })} className="btn bg-white py-2">Older →</Link>}
        </div>
      )}
    </div>
  );
}
