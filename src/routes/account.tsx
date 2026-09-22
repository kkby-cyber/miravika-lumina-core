import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — MIRAVIKA" },
      {
        name: "description",
        content: "Access your MIRAVIKA account, order history, addresses and wishlist.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Account,
});

function Account() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:py-20">
      <User className="h-8 w-8 text-gold" />
      <h1 className="mt-3 font-display text-4xl">Your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your MIRAVIKA customer account is powered by our secure commerce backend. Sign-in and
        customer session support are being connected to the storefront account experience.
      </p>

      <div className="mt-8 grid gap-3">
        <Link to="/track-order">
          <Button
            size="lg"
            className="w-full rounded-full bg-foreground text-ivory hover:bg-foreground/90"
          >
            <Package className="mr-2 h-4 w-4" />
            Track an order
          </Button>
        </Link>

        <Link to="/wishlist">
          <Button size="lg" variant="outline" className="w-full rounded-full">
            View wishlist
          </Button>
        </Link>
      </div>
    </div>
  );
}
