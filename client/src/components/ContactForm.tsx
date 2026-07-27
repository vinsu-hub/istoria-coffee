import { useState } from "react";

/**
 * ContactForm — name/email/message form → sends via mailto fallback.
 * When an email API is available, this can be upgraded to POST to a serverless function.
 */

interface ContactFormProps {
  recipientEmail?: string;
}

export default function ContactForm({ recipientEmail }: ContactFormProps) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const email = recipientEmail || "hello@istoria.coffee";
    const subject = encodeURIComponent(`Message from ${formData.name} via istoria.coffee`);
    const body = encodeURIComponent(
      `${formData.message}\n\nFrom: ${formData.name} <${formData.email}>`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="font-display text-xl text-charcoal mb-2">Thank you!</p>
        <p className="font-body text-sm text-charcoal-light">
          Your message is ready to send. Check your email client.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-body text-sm text-charcoal-light block mb-1">
          Name
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-cream border border-border rounded-sm font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-espresso/20 focus:border-espresso/40 transition-all"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="font-body text-sm text-charcoal-light block mb-1">
          Email
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 bg-cream border border-border rounded-sm font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-espresso/20 focus:border-espresso/40 transition-all"
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label className="font-body text-sm text-charcoal-light block mb-1">
          Message
        </label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-cream border border-border rounded-sm font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-espresso/20 focus:border-espresso/40 transition-all resize-none"
          placeholder="Tell us..."
        />
      </div>
      <button
        type="submit"
        className="w-full px-6 py-3 rounded-full bg-espresso text-warm-white text-sm font-body font-medium hover:bg-espresso-light transition-all duration-200 active:scale-[0.97]"
      >
        Send →
      </button>
    </form>
  );
}
