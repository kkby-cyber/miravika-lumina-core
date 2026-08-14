import { useEffect } from "react";
import { Loader2, Minus, Plus, ShoppingBag, Trash2, X, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";
import { itemFromProduct, trackBeginCheckout, trackViewCart } from "@/lib/analytics";
import { CartSuggestions, CouponField } from "@/components/site/CartSuggestions";


const FREE_SHIP_INR = 2999;
const FREE_SHIP_USD = 49;

export function CartDrawer() {
  const { items, isOpen, setOpen, isLoading, isSyncing, updateQuantity, removeItem, openCheckout, syncCart, cost } = useCartStore();
  const totalItems = items.reduce((a, b) => a + b.quantity, 0);
  // Prefer Shopify's own cart cost; the local sum is only a pre-sync placeholder.
  const currency = cost?.subtotalAmount.currencyCode || items[0]?.price.currencyCode || "INR";
  const total = cost
    ? parseFloat(cost.subtotalAmount.amount)
    : items.reduce((a, b) => a + parseFloat(b.price.amount) * b.quantity, 0);

  const threshold = currency === "INR" ? FREE_SHIP_INR : FREE_SHIP_USD;
  const remaining = Math.max(0, threshold - total);
  const progress = Math.min(100, (total / threshold) * 100);

  const ga4Items = () =>
    items.map((i, idx) =>
      itemFromProduct(i.product.node, { variantId: i.variantId, variantTitle: i.variantTitle, price: i.price.amount, quantity: i.quantity, index: idx }),
    );

  useEffect(() => {
    if (isOpen) {
      syncCart();
      if (items.length) trackViewCart(ga4Items(), currency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, syncCart]);

  const checkout = () => {
    // begin_checkout fires only when Shopify checkout actually opens.
    if (openCheckout()) {
      trackBeginCheckout(ga4Items(), currency);
      setOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex h-full w-full flex-col gap-0 bg-ivory p-0 sm:max-w-md">
        <SheetTitle className="sr-only">Shopping Bag</SheetTitle>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-border/60 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Your Bag</p>
              <h2 className="mt-1 font-display text-2xl tracking-tight">
                {totalItems === 0 ? "Empty" : `${totalItems} ${totalItems === 1 ? "item" : "items"}`}
              </h2>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-beige">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Free shipping progress */}
          {totalItems > 0 && (
            <div className="mt-4">
              {remaining > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Add <span className="font-medium text-foreground">{formatPrice(remaining, currency)}</span> more for <span className="text-gold">free shipping</span>
                </p>
              ) : (
                <p className="text-xs text-gold">✓ You've unlocked free shipping</p>
              )}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-beige">
                <div
                  className="h-full bg-gradient-to-r from-gold/70 to-gold transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-beige">
                <ShoppingBag className="h-6 w-6 text-gold" strokeWidth={1.4} />
              </div>
              <h3 className="mt-5 font-display text-xl">Your bag is beautifully empty</h3>
              <p className="mt-2 text-sm text-muted-foreground">Discover our latest edit — curated for you.</p>
              <Link
                to="/collection/$slug"
                params={{ slug: "new-arrivals" }}
                onClick={() => setOpen(false)}
                className="mt-6 rounded-full bg-noir px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-ivory hover:bg-foreground/85"
              >
                Shop New Arrivals
              </Link>
              <Link
                to="/collection/$slug"
                params={{ slug: "best-sellers" }}
                onClick={() => setOpen(false)}
                className="mt-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
              >
                Or view best sellers
              </Link>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {items.map((it) => {
                  const img = it.product.node.images?.edges?.[0]?.node;
                  return (
                    <div key={it.variantId} className="flex gap-4 border-b border-border/40 pb-4 last:border-0">
                      <Link
                        to="/product/$handle"
                        params={{ handle: it.product.node.handle }}
                        onClick={() => setOpen(false)}
                        className="h-24 w-20 flex-shrink-0 overflow-hidden rounded bg-beige"
                      >
                        {img && <img src={img.url} alt={img.altText ?? it.product.node.title} className="h-full w-full object-cover" />}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/product/$handle"
                            params={{ handle: it.product.node.handle }}
                            onClick={() => setOpen(false)}
                            className="line-clamp-2 text-sm font-medium hover:text-gold"
                          >
                            {it.product.node.title}
                          </Link>
                          <button
                            onClick={() => removeItem(it.variantId)}
                            aria-label="Remove"
                            className="text-muted-foreground transition hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {it.selectedOptions.length > 0 && it.variantTitle !== "Default Title" && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {it.selectedOptions.map((o) => o.value).join(" · ")}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-border">
                            <button
                              onClick={() => updateQuantity(it.variantId, it.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="grid h-7 w-7 place-items-center transition hover:text-gold"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs">{it.quantity}</span>
                            <button
                              onClick={() => updateQuantity(it.variantId, it.quantity + 1)}
                              aria-label="Increase quantity"
                              className="grid h-7 w-7 place-items-center transition hover:text-gold"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm font-medium">
                            {formatPrice(parseFloat(it.price.amount) * it.quantity, it.price.currencyCode)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Cross-sell, upsell and gift suggestions */}
                <div className="-mx-6">
                  <CartSuggestions compact />
                </div>
              </div>



              {/* Summary */}
              <div className="flex-shrink-0 border-t border-border/60 bg-ivory px-6 py-5">
                <CouponField />
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl">{formatPrice(total, currency)}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Taxes and shipping calculated at checkout.
                </p>

                <Button
                  onClick={checkout}
                  disabled={isLoading || isSyncing}
                  size="lg"
                  className="mt-4 h-12 w-full rounded-full bg-foreground text-[11px] uppercase tracking-[0.22em] text-ivory hover:bg-foreground/90"
                >
                  {isLoading || isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Secure Checkout"}
                </Button>
                <div className="mt-4 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-gold" /> Secure</span>
                  <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3 text-gold" /> Fast Ship</span>
                  <span className="inline-flex items-center gap-1"><Undo2 className="h-3 w-3 text-gold" /> Returns</span>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
