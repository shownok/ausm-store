import "server-only";
import { PAYMENT_LABELS, taka, ZONE_LABELS } from "./format";

interface NewOrderEmail {
  orderNumber: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  zone: string;
  paymentMethod: string;
  paymentRef?: string;
  note?: string;
  items: { name: string; variant: string; quantity: number; price: number }[];
}

/**
 * Optional: emails the store a copy of every new order using Resend
 * (https://resend.com, free tier). Set RESEND_API_KEY, ORDER_NOTIFY_EMAIL
 * and ORDER_FROM_EMAIL to enable. Failures never block the order.
 */
export async function notifyNewOrder(o: NewOrderEmail) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!key || !to) return;
  const from = process.env.ORDER_FROM_EMAIL ?? "ausm orders <onboarding@resend.dev>";

  const esc = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const rows = o.items
    .map(
      (i) =>
        `<tr><td>${esc(i.name)}${i.variant !== "Standard" ? ` (${esc(i.variant)})` : ""}</td><td>× ${i.quantity}</td><td>${taka(i.price * i.quantity)}</td></tr>`,
    )
    .join("");
  const html = `<h2>New order #${o.orderNumber} — ${taka(o.total)}</h2>
<p><b>${esc(o.customerName)}</b> · ${esc(o.phone)}<br>${esc(o.address)}, ${esc(o.city)} (${ZONE_LABELS[o.zone] ?? o.zone})</p>
<p>Payment: ${PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}${o.paymentRef ? ` · TrxID ${esc(o.paymentRef)}` : ""}</p>
${o.note ? `<p>Note: ${esc(o.note)}</p>` : ""}
<table cellpadding="6">${rows}</table>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: `New order #${o.orderNumber} — ${taka(o.total)}`, html }),
    });
    if (!res.ok) console.error("notifyNewOrder", res.status, await res.text());
  } catch (e) {
    console.error("notifyNewOrder", e);
  }
}
