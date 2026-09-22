import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Package, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order — MIRAVIKA" },
      {
        name: "description",
        content: "Track your MIRAVIKA order in real time or reach our customer care team for help.",
      },
    ],
    links: [{ rel: "canonical", href: "https://miravika.com/track-order" }],
  }),
  component: Track,
});

function Track() {
  const [order, setOrder] = useState("");
  const [email, setEmail] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order.trim() || !email.trim()) {
      toast.error("Enter your order number and email");
      return;
    }

    const nexusUrl = import.meta.env.VITE_NEXUS_API_URL;
    if (!nexusUrl) {
      toast.error("Order tracking is temporarily unavailable.");
      return;
    }

    try {
      const response = await fetch(`${nexusUrl}/api/public/orders/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_number: order.trim().replace(/^#/, ""),
          email: email.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        toast.error(payload?.error?.message ?? "We could not find that order.");
        return;
      }

      const trackingUrl = payload?.data?.tracking?.url;
      if (trackingUrl) {
        window.open(trackingUrl, "_blank", "noopener,noreferrer");
        toast.success("Opening your shipment tracking.");
        return;
      }

      toast.success("Order found. Shipment tracking is not available yet.");
    } catch {
      toast.error("Order tracking is temporarily unavailable.");
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-14 md:py-20">
      <Package className="h-8 w-8 text-gold" strokeWidth={1.4} />
      <p className="mt-3 text-[11px] uppercase tracking-[0.32em] text-gold">Order status</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">Track your order</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter your order number and the email used at checkout. You'll be taken to your live order
        status page.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-3 rounded-md border border-border/60 bg-card p-6"
      >
        <input
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="Order number (e.g. #1024)"
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email used at checkout"
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm"
        />
        <Button
          type="submit"
          className="w-full rounded-full bg-foreground text-ivory hover:bg-foreground/90"
        >
          Track order
        </Button>
      </form>
      <div className="mt-8 rounded-md border border-border/60 bg-ivory p-5 text-sm">
        <p className="font-medium">Need help with your order?</p>
        <div className="mt-3 flex flex-col gap-2 text-muted-foreground sm:flex-row sm:gap-6">
          <a
            href="mailto:support@miravika.com"
            className="flex items-center gap-2 hover:text-foreground"
          >
            <Mail className="h-4 w-4 text-gold" /> support@miravika.com
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4 text-gold" /> Chat on WhatsApp
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Prefer email? Visit our{" "}
          <Link to="/contact" className="underline underline-offset-4">
            contact page
          </Link>{" "}
          or read the{" "}
          <Link to="/faq" className="underline underline-offset-4">
            FAQs
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
