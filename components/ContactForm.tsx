"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name || "the website"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ""}`);
    window.location.href = `mailto:hello@istoria.coffee?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3.5 max-w-md">
      <div>
        <label htmlFor="contact-name" className="block text-xs text-ink/70 mb-1.5">
          Name
        </label>
        <input
          id="contact-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-xs text-ink/70 mb-1.5">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-xs text-ink/70 mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          className="input"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary self-start">
        Send message
      </button>
    </form>
  );
}
