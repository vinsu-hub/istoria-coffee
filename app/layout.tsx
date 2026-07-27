import type { Metadata } from "next";
import { Caprasimo, Figtree, Caveat } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  weight: "400",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  weight: ["500", "600"],
  subsets: ["latin"],
});

const title = "Istoria Coffee | Kape at Kwentuhan";
const description =
  "A small coffee shop in Bay, Laguna. Slow drinks, long conversations, open until the streets go quiet. Open daily, 12PM–3AM.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://istoria.coffee"),
  title,
  description,
  openGraph: {
    title,
    description,
    images: ["/images/og-image.jpg"],
    locale: "en_PH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caprasimo.variable} ${figtree.variable} ${caveat.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-cream text-ink overflow-x-clip">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
