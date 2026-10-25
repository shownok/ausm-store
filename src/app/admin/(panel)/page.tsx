import Link from "next/link";
import { adminDashboard } from "@/lib/admin";
import { formatDate, STATUS_STYLES, taka } from "@/lib/format";

export default async function DashboardPage() {
  const d = await adminDashboard();

  const stats = [
    ["Orders today", d.ordersToday.toString()],
    ["Pending orders", d.pending.toString()],
    ["Revenue (30 days)", taka(d.revenue30)],
    ["Orders (30 days)", d.orders30.toString()],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="btn btn-primary py-2 text-sm">+ Add product</Link>
          <Link href="/admin/orders?status=pending" className="btn btn-dark py-2 text-sm">Pending orders</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-navy/60">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-navy">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-navy/50">Revenue excludes cancelled and returned orders.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-crimson">View all</Link>
          </div>
          {d.recent.length ? (
            <ul className="divide-y divide-navy/10">
              {d.recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-sky/40">
                    <div>
                      <p className="font-medium">#{o.order_number} · {o.customer_name}</p>
                      <p className="text-xs text-navy/55">{formatDate(o.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{taka(o.total)}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-navy/55">No orders yet.</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Low stock (3 or fewer)</h2>
          {d.lowStock.length ? (
            <ul className="divide-y divide-navy/10 text-sm">
              {d.lowStock.map((v, i) => (
                <li key={i} className="flex items-center justify-between py-2.5">
                  <Link href={`/admin/products/${v.productId}`} className="hover:text-crimson">
                    {v.product} <span className="text-navy/50">· {v.variant}</span>
                  </Link>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${v.stock === 0 ? "bg-crimson text-white" : "bg-amber-100 text-amber-800"}`}>
                    {v.stock === 0 ? "Out" : v.stock}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-navy/55">All stocked up.</p>
          )}
          <p className="mt-4 text-xs text-navy/50">{d.productCount} products in the catalog.</p>
        </section>
      </div>
    </div>
  );
}
