import { Link } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const p = product.node;
  const variant = p.variants.edges[0]?.node;
  const img = p.images.edges[0]?.node;
  const img2 = p.images.edges[1]?.node;
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const isLoading = useCartStore((s) => s.isLoading);
  const [busy, setBusy] = useState(false);
  const wished = useWishlistStore((s) => s.has(p.handle));
  const toggleWish = useWishlistStore((s) => s.toggle);

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
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
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-beige">
        {img && (
          <img
            src={img.url}
            alt={img.altText ?? p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
        )}
        {img2 ? (
          <img
            src={img2.url}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : null}
        <button
          aria-label="Wishlist"
          onClick={(e) => {
            e.preventDefault();
            toggleWish(p.handle);
          }}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ivory/90 backdrop-blur transition hover:bg-ivory"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : "text-foreground/70"}`} />
        </button>
        <button
          onClick={onAdd}
          disabled={busy || isLoading || !variant?.availableForSale}
          className="absolute inset-x-2 bottom-2 translate-y-12 rounded-full bg-foreground py-2 text-xs uppercase tracking-[0.18em] text-ivory opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-50 md:text-[11px]"
        >
          {busy ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : variant?.availableForSale ? "Add to Bag" : "Sold Out"}
        </button>
      </div>
      <div className="mt-3 px-1">
        <h3 className="line-clamp-1 text-sm font-medium text-foreground">{p.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
        </p>
      </div>
    </Link>
  );
}
