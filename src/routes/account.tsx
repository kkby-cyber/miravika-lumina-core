import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — MIRAVIKA" },
      { name: "description", content: "Access your MIRAVIKA account — orders, addresses, wishlist and reorders in one secure place." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Account,
});

function Account() {
  const accountUrl = "https://miravika-operating-system-ngwql.myshopify.com/account";
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:py-20">
      <User className="h-8 w-8 text-gold" />
      <h1 className="mt-3 font-display text-4xl">Your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        MIRAVIKA accounts are securely managed by Shopify — login, addresses, order history and reorders all live in one place.
      </p>
      <div className="mt-8 grid gap-3">
        <a href={accountUrl} target="_blank" rel="noreferrer">
          <Button size="lg" className="w-full rounded-full bg-foreground text-ivory hover:bg-foreground/90">
            Login / Sign up <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
        <Link to="/track-order">
          <Button size="lg" variant="outline" className="w-full rounded-full">
            <Package className="mr-2 h-4 w-4" /> Track an order
          </Button>
        </Link>
      </div>
    </div>
  );
}
