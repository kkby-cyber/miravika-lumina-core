import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  head: () => ({ meta: [{ title: "Track Order — MIRAVIKA" }] }),
  component: Track,
});

function Track() {
  const [order, setOrder] = useState("");
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.trim() || !email.trim()) {
      toast.error("Enter your order number and email");
      return;
    }
    // Shopify-hosted order status is the source of truth
    toast.success("Opening your order status…");
    window.open(`https://miravika-operating-system-ngwql.myshopify.com/account/orders`, "_blank");
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-14 md:py-20">
      <Package className="h-8 w-8 text-gold" />
      <h1 className="mt-3 font-display text-4xl">Track your order</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter your order number and the email you used at checkout.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-3 rounded-md border border-border/60 bg-card p-6">
        <input value={order} onChange={(e) => setOrder(e.target.value)} placeholder="Order number (e.g. #1024)" className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email used at checkout" className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" />
        <Button type="submit" className="w-full rounded-full bg-foreground text-ivory hover:bg-foreground/90">Track</Button>
      </form>
    </div>
  );
}
