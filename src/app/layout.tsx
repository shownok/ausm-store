import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ausm.com.bd";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ausm — The art of life",
    template: "%s · ausm",
  },
  description:
    "ausm is a Bangladeshi fashion and lifestyle brand. Tees, hoodies, accessories, phone cases and more, with Cash on Delivery across Bangladesh.",
  openGraph: {
    siteName: "ausm",
    type: "website",
    locale: "en_BD",
  },
};

export const viewport: Viewport = {
  themeColor: "#25274d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
