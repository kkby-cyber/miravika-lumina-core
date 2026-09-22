import { useState } from "react";
import { toast } from "sonner";
import { trackGenerateLead, trackSignUp } from "@/lib/analytics";

/** Quiet, editorial email capture — no popup, no urgency devices. */
export function Newsletter() {
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    trackGenerateLead("newsletter_home");
    trackSignUp("newsletter");
    toast.success("Welcome to MIRAVIKA", {
      description: "Check your inbox for 10% off your first order.",
    });
    setEmail("");
  };

  return (
    <section aria-labelledby="newsletter-heading" className="border-y border-border/50 bg-beige/40">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center md:py-28">
        <p className="text-[10px] uppercase tracking-[0.36em] text-gold">The Miravika List</p>
        <h2
          id="newsletter-heading"
          className="mt-4 font-display text-3xl leading-tight md:text-[42px]"
        >
          Everyday luxury, delivered.
        </h2>
        <div className="mx-auto mt-5 h-px w-16 gold-line" />
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          Private access to new arrivals, editorial stories and 10% off your first order.
        </p>
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="home-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="home-newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="min-h-12 flex-1 rounded-full border border-foreground/15 bg-card px-6 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          />
          <button
            type="submit"
            className="min-h-12 rounded-full bg-noir px-10 text-[11px] uppercase tracking-[0.24em] text-ivory transition-colors duration-300 hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Subscribe
          </button>
        </form>
        <p className="mt-4 text-[11px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
