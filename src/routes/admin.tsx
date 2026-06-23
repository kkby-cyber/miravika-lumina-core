import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, ExternalLink, Lock, Megaphone, MessageCircle, Package, Settings, ShoppingCart, Tag, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — MIRAVIKA" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const ADMIN = "https://admin.shopify.com/store/miravika-operating-system-ngwql";
const GATE_KEY = "miravika_admin_gate_v1";
// Owner-only passphrase. Change anytime from this file.
const ADMIN_PASSPHRASE = "miravika-owner-2026";

const tiles = [
  { icon: ShoppingCart, label: "Orders", desc: "View, fulfil, refund & invoice orders", href: `${ADMIN}/orders` },
  { icon: Package, label: "Products & Inventory", desc: "Add products, variants, stock levels", href: `${ADMIN}/products` },
  { icon: Users, label: "Customers", desc: "Customer list, segments, lifetime value", href: `${ADMIN}/customers` },
  { icon: BarChart3, label: "Analytics & Reports", desc: "Sales, conversion, top products", href: `${ADMIN}/analytics` },
  { icon: Tag, label: "Discounts & Coupons", desc: "Create automatic & code-based offers", href: `${ADMIN}/discounts` },
  { icon: Megaphone, label: "Marketing", desc: "Email campaigns, automations, ads", href: `${ADMIN}/marketing` },
  { icon: MessageCircle, label: "Apps (WhatsApp, Reviews)", desc: "Install WhatsApp, reviews & SMS apps", href: `${ADMIN}/apps` },
  { icon: Settings, label: "Store Settings", desc: "Payments (Razorpay/UPI/COD), shipping, taxes", href: `${ADMIN}/settings` },
];

function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem(GATE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  if (!unlocked) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
        <div className="rounded-md border border-border/60 bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-beige text-gold"><Lock className="h-5 w-5" /></span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Restricted</p>
              <h1 className="font-display text-2xl">Owner Access</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            This dashboard is for the store owner. Enter the passphrase to continue.
          </p>
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (input === ADMIN_PASSPHRASE) {
                window.localStorage.setItem(GATE_KEY, "1");
                setUnlocked(true);
                setError("");
              } else {
                setError("Incorrect passphrase.");
              }
            }}
          >
            <input
              type="password"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Passphrase"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-full bg-foreground px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-ivory hover:bg-foreground/90">
              Unlock
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">← Back to storefront</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Operating System</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Business Dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Every part of MIRAVIKA — orders, inventory, customers, payments, marketing — runs on Shopify under the hood. Jump straight into the right section below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              window.localStorage.removeItem(GATE_KEY);
              setUnlocked(false);
              setInput("");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] hover:border-gold"
          >
            Lock
          </button>
          <a href={ADMIN} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-ivory hover:bg-foreground/90">
            Open Shopify Admin <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <a key={t.label} href={t.href} target="_blank" rel="noreferrer" className="group rounded-md border border-border/60 bg-card p-5 transition hover:border-gold">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-beige text-gold"><t.icon className="h-5 w-5" /></span>
              <h3 className="font-display text-lg">{t.label}</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t.desc}</p>
            <p className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-foreground/80 group-hover:text-gold">
              Open <ExternalLink className="h-3 w-3" />
            </p>
          </a>
        ))}
      </div>

      <div className="mt-10 rounded-md border border-dashed border-border/70 bg-beige/40 p-6 text-sm">
        <h3 className="font-display text-lg">Quick ways to manage MIRAVIKA from chat</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>"Create a Silk Cloud Scrunchie in Ivory at ₹499 with 50 in stock"</li>
          <li>"Generate a 15% discount code WELCOME15"</li>
          <li>"Show me my latest orders" or "How many products are in stock?"</li>
          <li>"Update the price of Pearl Bow to ₹699"</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Just tell the Lovable chat — it talks to Shopify for you and confirms before applying.</p>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Looking for a static page? <Link to="/" className="underline-offset-4 hover:underline">Back to storefront →</Link>
      </p>
    </div>
  );
}
