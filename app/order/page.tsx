import type { Metadata } from "next";
import Link from "next/link";
import OrderOptionCard from "@/components/OrderOptionCard";

const title = "Order Now | Istoria Coffee";
const description = "Order Istoria Coffee via Grab, foodpanda, or message us directly.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: ["/images/og-image.jpg"] },
};

export default function OrderPage() {
  return (
    <div className="px-5 md:px-10 pt-10 pb-16 max-w-3xl">
      <h1 className="text-[32px] md:text-[42px] leading-tight mb-2">
        Order Now
      </h1>
      <p className="text-ink/70 text-[15px] mb-10">
        Gutom na? I-order na sa Grab o foodpanda.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <OrderOptionCard
          name="Grab"
          blurb="Order Istoria Coffee for delivery through the Grab app."
        />
        <OrderOptionCard
          name="foodpanda"
          blurb="Order Istoria Coffee for delivery through the foodpanda app."
        />
      </div>

      <div className="mt-4 max-w-xs">
        <OrderOptionCard
          name="Messenger"
          blurb="For custom or direct orders not suited to a delivery app."
          href="https://m.me/coffee.istoria"
        />
      </div>

      <Link
        href="/menu"
        className="inline-block mt-10 text-sm font-semibold text-accent-700 hover:text-accent-800"
      >
        View menu →
      </Link>
    </div>
  );
}
