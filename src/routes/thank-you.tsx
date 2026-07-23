import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Thank You — MIRAVIKA" },
      { name: "description", content: "Your MIRAVIKA order has been received. Watch your inbox for tracking updates." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
      <h1 className="mt-6 font-display text-4xl">Thank you</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Your order has been received. We've sent a confirmation to your email and WhatsApp. Watch your inbox — your MIRAVIKA piece is on its way.
      </p>
      <div className="mx-auto mt-6 h-px w-20 gold-line" />
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/track-order" className="rounded-full bg-foreground px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-ivory hover:bg-foreground/90">Track Order</Link>
        <Link to="/shop" className="rounded-full border border-border px-6 py-2.5 text-xs uppercase tracking-[0.18em] hover:bg-beige">Continue Shopping</Link>
      </div>
    </div>
  );
}
