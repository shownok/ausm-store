import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/store/info-page";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <InfoPage eyebrow="The art of life" title="About ausm">
      {/* TODO: replace with the brand's own story */}
      <p>
        ausm started on Instagram as a small custom-print label with one idea: what you wear should say
        something about you. Today we make everyday fashion and lifestyle pieces, from heavyweight tees
        and hoodies to caps, bags, drinkware and phone cases.
      </p>
      <p>
        Everything is designed in Bangladesh, made in small runs, and checked by hand before it ships.
        We&apos;d rather make fewer things well than chase every trend.
      </p>
      <h2>Why &ldquo;ausm&rdquo;?</h2>
      <p>Because you are. Wear it like you mean it.</p>
      <p>
        <Link href="/shop">Shop the collection</Link> or <Link href="/contact">get in touch</Link>.
      </p>
    </InfoPage>
  );
}
