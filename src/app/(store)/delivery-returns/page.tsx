import type { Metadata } from "next";
import { InfoPage } from "@/components/store/info-page";
import { getSettings } from "@/lib/data";
import { taka } from "@/lib/format";

export const metadata: Metadata = { title: "Delivery & returns" };

export default async function DeliveryPage() {
  const s = await getSettings();
  return (
    <InfoPage title="Delivery & returns">
      {/* TODO: confirm these policies with the brand */}
      <h2>Delivery</h2>
      <ul>
        <li>Inside Dhaka: {taka(s.delivery_inside_dhaka)}, usually 1–3 working days.</li>
        <li>Outside Dhaka: {taka(s.delivery_outside_dhaka)}, usually 3–5 working days.</li>
        {s.free_delivery_over && <li>Free delivery on orders over {taka(s.free_delivery_over)}.</li>}
        <li>We&apos;ll call or WhatsApp you to confirm every order before it ships.</li>
      </ul>
      <h2>Payment</h2>
      <ul>
        <li>Cash on Delivery anywhere in Bangladesh.</li>
        <li>bKash or Nagad: send the total to our number and add the transaction ID at checkout.</li>
      </ul>
      <h2>Exchange &amp; returns</h2>
      <ul>
        <li>Exchange within 7 days of delivery for a different size or item.</li>
        <li>Items must be unused, unwashed and have their tags attached.</li>
        <li>If we sent the wrong or a damaged item, we cover the delivery both ways.</li>
        <li>Custom-printed items can&apos;t be exchanged unless they arrive damaged.</li>
      </ul>
      <p>To start an exchange, message us on WhatsApp with your order number and a photo of the item.</p>
    </InfoPage>
  );
}
