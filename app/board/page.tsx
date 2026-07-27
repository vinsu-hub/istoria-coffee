import type { Metadata } from "next";
import BoardPageClient from "@/components/Board/BoardPageClient";

const title = "Freedom Board | Istoria Coffee";
const description = "The Kwentuhan Wall — notes left by Istoria Coffee customers.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: ["/images/og-image.jpg"] },
};

export default function BoardPage() {
  return <BoardPageClient />;
}
