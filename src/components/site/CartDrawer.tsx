import { useEffect } from "react";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

export function CartDrawer() {
  const { items, isOpen, setOpen, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((a, b) => a + b.quantity, 0);
  const currency = items[0]?.price.currencyCode || "INR";
  const total = items.reduce((a, b) => a + parseFloat(b.price.amount) * b.quantity, 0);

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const checkout = () => {
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, "_blank");
      setOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-md">
        <SheetHeader className="flex-shrink-0 border-b pb-4">
          <SheetTitle className="font-display text-2xl tracking-wider">Your Bag</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your bag is empty" : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-4">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nothing here yet</p>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                {items.map((it) => {
                  const img = it.product.node.images?.edges?.[0]?.node;
                  return (
                    <div key={it.variantId} className="flex gap-3 rounded-md border border-border/50 bg-card p-3">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-beige">
                        {img && <img src={img.url} alt={img.altText ?? it.product.node.title} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="truncate text-sm font-medium">{it.product.node.title}</h4>
                          <button onClick={() => removeItem(it.variantId)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {it.selectedOptions.length > 0 && it.variantTitle !== "Default Title" && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{it.selectedOptions.map((o) => o.value).join(" · ")}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-border/70">
                            <button onClick={() => updateQuantity(it.variantId, it.quantity - 1)} className="grid h-7 w-7 place-items-center hover:text-gold">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs">{it.quantity}</span>
                            <button onClick={() => updateQuantity(it.variantId, it.quantity + 1)} className="grid h-7 w-7 place-items-center hover:text-gold">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold">{formatPrice(parseFloat(it.price.amount) * it.quantity, it.price.currencyCode)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex-shrink-0 space-y-3 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display text-lg">{formatPrice(total, currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Taxes and shipping calculated at checkout.</p>
                <Button onClick={checkout} disabled={isLoading || isSyncing} size="lg" className="w-full bg-foreground text-ivory hover:bg-foreground/90">
                  {isLoading || isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Secure Checkout"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
