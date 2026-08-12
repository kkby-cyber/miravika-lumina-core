import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Store Admin — MIRAVIKA" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Sign in to the MIRAVIKA store admin." },
    ],
  }),
  component: Admin,
});

// Public sign-in entry point only. All authentication and every piece of
// operational data lives behind Shopify staff login — nothing sensitive is
// rendered here, and there is no client-side "gate" to bypass.
const ADMIN = "https://admin.shopify.com/store/miravika-operating-system-ngwql";

function Admin() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-md border border-border/60 bg-card p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-beige text-gold">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-gold">Staff Only</p>
        <h1 className="mt-2 font-display text-3xl">Store Admin</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Orders, inventory, customers and payments are managed in the Shopify admin.
          Sign in with your staff account to continue.
        </p>
        <a
          href={ADMIN}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-ivory hover:bg-foreground/90"
        >
          Sign in to Shopify Admin <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <p className="mt-5 text-xs text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            ← Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
