import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import LocationMap from "@/components/LocationMap";

const title = "Contact Us | Istoria Coffee";
const description = "Get in touch with Istoria Coffee — Messenger, email, or the contact form.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: ["/images/og-image.jpg"] },
};

export default function ContactPage() {
  return (
    <div className="pt-10 pb-16">
      <div className="px-5 md:px-10 max-w-3xl">
        <h1 className="text-[32px] md:text-[42px] leading-tight mb-2">
          Contact Us
        </h1>
        <p className="text-ink/70 text-[15px] mb-10">
          May tanong? Message lang kami.
        </p>

        <div className="grid gap-10 md:grid-cols-2">
          <ContactForm />

          <div className="grid gap-4 text-[15px]">
            <a
              href="https://m.me/coffee.istoria"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent-700 hover:text-accent-800"
            >
              Message us on Messenger →
            </a>
            <a href="mailto:hello@istoria.coffee" className="text-ink/80 hover:text-accent-700">
              hello@istoria.coffee
            </a>
            <span className="text-ink/50 text-sm">
              Phone number pending confirmation with the shop.
            </span>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <LocationMap />
      </div>
    </div>
  );
}
