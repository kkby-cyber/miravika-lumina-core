import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Gift, Loader2, Plus, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { useCollection, useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/format-price";
import type { FrontendProduct } from "@/lib/nexus-product";
import { Button } from "@/components/ui/button";

/** Coupon entry — the code is applied on Shopify's hosted checkout. */
export function CouponField() {
  const discountCode = useCartStore((s) => s.discountCode);
  const setDiscountCode = useCartStore((s) => s.setDiscountCode);
  const [value, setValue] = useState("");

  if (discountCode) {
    return (
      <div className="mt-4 flex items-center justify-between rounded-lg border border-gold/40 bg-gold/5 px-3 py-2.5">
        <span className="inline-flex items-center gap-2 text-xs">
          <Tag className="h-3.5 w-3.5 text-gold" />
          <span className="font-medium tracking-wide">{discountCode}</span>
          <span className="text-muted-foreground">will apply at checkout</span>
        </span>
        <button
          onClick={() => setDiscountCode(null)}
          aria-label="Remove coupon"
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const code = value.trim();
        if (code.length < 2) {
          toast.error("Enter a valid coupon code");
          return;
        }
        setDiscountCode(code);
        setValue("");
        toast.success("Coupon saved — applied at checkout");
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={40}
        aria-label="Coupon code"
        placeholder="Coupon code"
        className="min-w-0 flex-1 rounded-full border border-border bg-ivory px-4 py-2.5 text-xs uppercase tracking-[0.14em] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus:border-gold"
      />
      <Button
        type="submit"
        variant="outline"
        className="rounded-full border-foreground/25 px-5 text-[11px] uppercase tracking-[0.18em] hover:border-gold hover:text-gold"
      >
        Apply
      </Button>
    </form>
  );
}

function MiniAddRow({ product, onDone }: { product: FrontendProduct; onDone?: () => void }) {
  const addItem = useCartStore((s) => s.addItem);
  const [busy, setBusy] = useState(false);
  const p = product;
  const variant = p.variants.edges.find((v) => v.node.availableForSale)?.node ?? p.variants.edges[0]?.node;
  const img = p.images.edges[0]?.node;

  const add = async () => {
    if (!variant?.availableForSale) return;
    setBusy(true);
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions,
      });
      toast.success("Added to bag", { position: "top-center" });
      onDone?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/product/$handle"
        params={{ handle: p.handle }}
        className="h-14 w-12 flex-shrink-0 overflow-hidden rounded bg-beige"
      >
        {img && (
          <img
            src={img.url}
            alt={img.altText ?? p.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to="/product/$handle"
          params={{ handle: p.handle }}
          className="line-clamp-1 text-xs font-medium hover:text-gold"
        >
          {p.title}
        </Link>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {formatPrice(
            parseFloat(p.priceRange.minVariantPrice.amount),
            p.priceRange.minVariantPrice.currencyCode,
          )}
        </p>
      </div>
      <button
        onClick={add}
        disabled={busy || !variant?.availableForSale}
        aria-label={`Add ${p.title} to bag`}
        className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-border transition hover:border-gold hover:text-gold disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

/**
 * Cart cross-sell / upsell / gift suggestions.
 * Sources: `gifting` collection for gifts, best sellers for cross-sell — real
 * Shopify products only, and anything already in the bag is filtered out.
 */
export function CartSuggestions({ compact = false }: { compact?: boolean }) {
  const items = useCartStore((s) => s.items);
  const inBag = new Set(items.map((i) => i.product.handle));

  const { data: best } = useCollection("best-sellers", 10);
  const { data: gifts } = useCollection("gifting", 10);
  const { data: fallback = [] } = useProducts(undefined, 10);

  const crossSell = (best?.products ?? fallback)
    .filter((p) => !inBag.has(p.handle))
    .slice(0, compact ? 3 : 4);

  const giftPicks = (gifts?.products ?? [])
    .filter((p) => !inBag.has(p.handle) && !crossSell.some((c) => c.handle === p.handle))
    .slice(0, compact ? 2 : 3);

  if (!items.length || (!crossSell.length && !giftPicks.length)) return null;

  return (
    <div className="border-t border-border/50 px-6 py-5">
      {crossSell.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">
            Pairs beautifully with
          </p>
          <div className="mt-3 space-y-3">
            {crossSell.map((p) => (
              <MiniAddRow key={p.id} product={p} />
            ))}
          </div>
        </>
      )}

      {giftPicks.length > 0 && (
        <>
          <p className="mt-6 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-gold">
            <Gift className="h-3 w-3" /> Add a gift
          </p>
          <div className="mt-3 space-y-3">
            {giftPicks.map((p) => (
              <MiniAddRow key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
