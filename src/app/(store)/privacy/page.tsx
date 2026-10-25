import type { Metadata } from "next";
import { InfoPage } from "@/components/store/info-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy policy">
      {/* TEMPLATE: have this reviewed before launch */}
      <p>This policy explains what information ausm collects when you shop with us and how we use it.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Your name, phone number, delivery address and (optionally) email when you place an order.</li>
        <li>Payment transaction IDs if you pay by bKash or Nagad. We never see your PIN or account details.</li>
        <li>Basic, anonymous analytics about how the site is used.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To confirm, deliver and support your order.</li>
        <li>To share your delivery details with our courier partner.</li>
        <li>We don&apos;t sell your information to anyone.</li>
      </ul>
      <h2>Your cart</h2>
      <p>Your cart is saved in your own browser so it&apos;s still there when you come back.</p>
      <h2>Contact</h2>
      <p>To ask about or delete your data, contact us through the details on our contact page.</p>
    </InfoPage>
  );
}
