import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useProductRating } from "@/hooks/useReviews";
import { InlineRating } from "@/components/site/Stars";
import { itemFromProduct, trackAddToWishlist, trackRemoveFromWishlist } from "@/lib/analytics";


export function ProductCard({ product, priority = false }: { product: ShopifyProduct; priority?: boolean }) {
  const p = product.node;
  const variant = p.variants.edges[0]?.node;
  const img = p.images.edges[0]?.node;
  const img2 = p.images.edges[1]?.node;
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const [busy, setBusy] = useState(false);
  const wished = useWishlistStore((s) => s.has(p.handle));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const navigate = useNavigate();
  const rating = useProductRating(p.handle);


  const compareAmt = variant?.compareAtPrice?.amount
    ? parseFloat(variant.compareAtPrice.amount)
    : p.compareAtPriceRange?.minVariantPrice.amount
      ? parseFloat(p.compareAtPriceRange.minVariantPrice.amount)
      : null;
  const priceAmt = parseFloat(p.priceRange.minVariantPrice.amount);
  const currency = p.priceRange.minVariantPrice.currencyCode;
  const onSale = compareAmt !== null && compareAmt > priceAmt;
  const soldOut = !variant?.availableForSale;
  const hasVariants = (p.options?.[0]?.values?.length ?? 1) > 1 || (p.variants.edges.length > 1);

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    if (hasVariants) {
      // Direct to PDP for variant selection (SPA nav, preserves scroll & preload)
      navigate({ to: "/product/$handle", params: { handle: p.handle } });
      return;
    }
    setBusy(true);
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions ?? [],
    });
    setBusy(false);
    toast.success("Added to bag", { position: "top-center" });
    setOpen(true);
  };


  return (
    <Link to="/product/$handle" params={{ handle: p.handle }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-beige shadow-[0_14px_36px_-30px_rgba(17,17,17,0.55)] transition-shadow duration-700 group-hover:shadow-[0_26px_50px_-28px_rgba(17,17,17,0.4)]">
        {img && (
          <img
            src={img.url}
            alt={img.altText ?? p.title}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="h-full w-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-0"
          />
        )}
        {img2 && (
          <img
            src={img2.url}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}

        {/* Quiet status label only — no discount stickers */}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ivory/90 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-foreground/70 backdrop-blur">
            Sold Out
          </span>
        )}


        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            const ga = [itemFromProduct(p)];
            const cur = p.priceRange.minVariantPrice.currencyCode;
            wished ? trackRemoveFromWishlist(ga, cur) : trackAddToWishlist(ga, cur);
            toggleWish(p.handle);
          }}

          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ivory/90 backdrop-blur transition hover:bg-ivory"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : "text-foreground/70"}`} strokeWidth={1.5} />
        </button>

        {/* Quick add */}
        {!soldOut && (
          <button
            onClick={onAdd}
            disabled={busy}
            aria-label={hasVariants ? "Choose options" : "Quick add"}
            className="absolute inset-x-2 bottom-2 hidden translate-y-3 items-center justify-center gap-2 rounded-full bg-foreground py-2.5 text-[11px] uppercase tracking-[0.18em] text-ivory opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-50 md:inline-flex"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                {hasVariants ? "Choose Options" : "Quick Add"}
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="line-clamp-2 text-[13px] leading-snug font-medium text-foreground md:text-sm">{p.title}</h3>
        <InlineRating average={rating?.average} count={rating?.count} />

        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-[13px] text-foreground md:text-sm">
            {formatPrice(priceAmt, currency)}
          </p>
          {onSale && compareAmt && (
            <p className="text-[11px] text-muted-foreground line-through md:text-xs">
              {formatPrice(compareAmt, currency)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
