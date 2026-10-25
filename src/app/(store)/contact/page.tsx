import type { Metadata } from "next";
import { InfoPage } from "@/components/store/info-page";
import { getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <InfoPage eyebrow="Say hi" title="Contact us">
      <p>The fastest way to reach us is WhatsApp. We usually reply within a few hours, 10am–8pm every day.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <a href={whatsappLink(s.whatsapp)} target="_blank" rel="noreferrer" className="rounded-2xl bg-sky p-5 !no-underline">
          <span className="block font-semibold text-navy">WhatsApp</span>
          <span className="text-sm text-navy/70">+{s.whatsapp}</span>
        </a>
        <a href={`mailto:${s.email}`} className="rounded-2xl bg-sky p-5 !no-underline">
          <span className="block font-semibold text-navy">Email</span>
          <span className="text-sm text-navy/70">{s.email}</span>
        </a>
        <a href="https://www.instagram.com/ausmbd/" target="_blank" rel="noreferrer" className="rounded-2xl bg-sky p-5 !no-underline">
          <span className="block font-semibold text-navy">Instagram</span>
          <span className="text-sm text-navy/70">@ausmbd</span>
        </a>
      </div>
      <p>For order questions, please include your order number.</p>
    </InfoPage>
  );
}
