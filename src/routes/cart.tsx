import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { itemFromProduct, trackBeginCheckout } from "@/lib/analytics";
import { CartSuggestions, CouponField } from "@/components/site/CartSuggestions";
import { SecurePaymentIcons } from "@/components/site/SecurePaymentIcons";


export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — MIRAVIKA" },
      { name: "description", content: "Review the items in your MIRAVIKA shopping bag and proceed to secure checkout." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQuantity, removeItem, openCheckout, cost } = useCartStore();
  // Shopify's cart cost is authoritative; the local sum is only a pre-sync placeholder.
  const currency = cost?.subtotalAmount.currencyCode || items[0]?.price.currencyCode || "INR";
  const subtotal = cost
    ? parseFloat(cost.subtotalAmount.amount)
    : items.reduce((a, b) => a + parseFloat(b.price.amount) * b.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <h1 className="font-display text-3xl md:text-5xl">Your Bag</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border/70 bg-beige/30 p-12 text-center">
          <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-gold" />
          <h3 className="font-display text-xl">Your bag is empty</h3>
          <Link to="/shop" className="mt-4 inline-block text-xs uppercase tracking-[0.18em] underline-offset-4 hover:underline">Continue shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((it) => {
              const img = it.product.node.images?.edges?.[0]?.node;
              return (
                <div key={it.variantId} className="flex gap-4 rounded-md border border-border/60 bg-card p-4">
                  <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md bg-beige">
                    {img && <img src={img.url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-medium">{it.product.node.title}</h3>
                      <p className="text-xs text-muted-foreground">{it.selectedOptions.map((o) => o.value).join(" · ")}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-border px-2">
                        <button onClick={() => updateQuantity(it.variantId, it.quantity - 1)} className="px-2">−</button>
                        <span className="w-6 text-center text-sm">{it.quantity}</span>
                        <button onClick={() => updateQuantity(it.variantId, it.quantity + 1)} className="px-2">+</button>
                      </div>
                      <p className="font-display text-lg">{formatPrice(parseFloat(it.price.amount) * it.quantity, it.price.currencyCode)}</p>
                    </div>
                    <button onClick={() => removeItem(it.variantId)} className="text-left text-xs text-muted-foreground hover:text-destructive">Remove</button>
                  </div>
                </div>
              );
            })}

            {/* Cross-sell, upsell and gift suggestions */}
            <div className="rounded-md border border-border/60 bg-card">
              <CartSuggestions />
            </div>
          </div>
          <aside className="h-fit rounded-md border border-border/60 bg-card p-6">
            <h3 className="font-display text-xl">Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal, currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Calculated at checkout</span></div>
            </div>
            <CouponField />
            <div className="my-4 gold-line" />
            <Button onClick={() => {
              if (!openCheckout()) return;
              trackBeginCheckout(
                items.map((i, idx) => itemFromProduct(i.product.node, { variantId: i.variantId, variantTitle: i.variantTitle, price: i.price.amount, quantity: i.quantity, index: idx })),
                currency,
              );
            }} size="lg" className="w-full rounded-full bg-foreground text-ivory hover:bg-foreground/90">
              Secure Checkout
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">UPI · Cards · Net Banking · Wallets</p>
            <SecurePaymentIcons className="mt-4" />
          </aside>

        </div>
      )}
    </div>
  );
}
