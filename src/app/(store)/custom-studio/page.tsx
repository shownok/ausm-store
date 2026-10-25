import type { Metadata } from "next";
import Image from "next/image";
import { getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Custom Studio",
  description: "Put your own design on a tee, hoodie, mug or phone case.",
};

export default async function CustomStudioPage() {
  const s = await getSettings();
  const wa = whatsappLink(
    s.whatsapp,
    "Hi ausm! I'd like a custom order.\nProduct: \nSize / phone model: \nQuantity: \n(I'll attach my design)",
  );
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-3xl">
        <Image src="/brand/custom-studio-banner.jpg" alt="ausm custom print tee and phone case" width={1556} height={592} priority className="h-[260px] w-full object-cover object-left sm:h-auto" />
      </div>
      <div className="mx-auto mt-12 max-w-3xl text-center">
        <p className="font-brush text-4xl text-crimson sm:text-5xl">Design your imagination</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Custom Studio</h1>
        <p className="mt-4 text-navy/75">
          Your art, photo or words, printed on tees, hoodies, mugs, totes and phone cases. Perfect for
          gifts, teams, events and one-of-a-kind pieces.
        </p>
      </div>
      <ol className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
        {[
          ["Pick a product", "Tee, hoodie, mug, tote or a phone case for your model."],
          ["Send your design", "Share a high-resolution image or tell us your idea."],
          ["Approve & receive", "We send a mockup to approve, then print and deliver."],
        ].map(([t, b], i) => (
          <li key={t} className="rounded-2xl bg-sky p-6">
            <span className="font-brush text-4xl text-crimson">{i + 1}</span>
            <p className="mt-2 font-semibold">{t}</p>
            <p className="mt-1 text-sm text-navy/70">{b}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 text-center">
        <a href={wa} target="_blank" rel="noreferrer" className="btn btn-primary px-8 py-3.5 text-base">
          Start a custom order on WhatsApp
        </a>
        <p className="mt-3 text-sm text-navy/55">An upload-your-design form is coming soon.</p>
      </div>
    </div>
  );
}
