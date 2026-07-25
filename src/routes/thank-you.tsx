import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { trackPurchase } from "@/lib/analytics";

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

/**
 * Fires the GA4/Ads purchase conversion when Shopify returns the shopper here
 * with order details (?order_id=&value=&currency=). De-duplicated per order id
 * inside trackPurchase, so refreshes never double-count a conversion.
 */
function usePurchaseConversion() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const id = q.get("order_id") || q.get("order") || q.get("transaction_id");
    const value = Number(q.get("value") ?? q.get("total") ?? 0);
    if (!id || !Number.isFinite(value)) return;
    trackPurchase({
      transaction_id: id,
      value,
      currency: q.get("currency") ?? "INR",
      shipping: Number(q.get("shipping") ?? 0) || 0,
      tax: Number(q.get("tax") ?? 0) || 0,
      coupon: q.get("coupon") ?? undefined,
    });
  }, []);
}

function ThankYou() {
  usePurchaseConversion();
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
