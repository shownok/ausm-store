import type { Metadata } from "next";
import { InfoPage } from "@/components/store/info-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <InfoPage title="Terms & conditions">
      {/* TEMPLATE: have this reviewed before launch */}
      <p>By placing an order on this site you agree to these terms.</p>
      <h2>Orders</h2>
      <ul>
        <li>An order is confirmed once we&apos;ve contacted you by phone or WhatsApp.</li>
        <li>We may cancel an order if an item is out of stock or the details can&apos;t be verified.</li>
      </ul>
      <h2>Prices</h2>
      <ul>
        <li>All prices are in Bangladeshi Taka (৳) and include VAT where applicable.</li>
        <li>Delivery charges are shown at checkout before you place your order.</li>
      </ul>
      <h2>Product images</h2>
      <p>Colours may look slightly different on different screens.</p>
      <h2>Exchanges</h2>
      <p>See our Delivery &amp; returns page for the exchange policy.</p>
    </InfoPage>
  );
}
