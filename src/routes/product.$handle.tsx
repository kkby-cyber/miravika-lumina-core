import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Heart, Loader2, Minus, Plus, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProductCard } from "@/components/site/ProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle.replace(/-/g, " ")} — MIRAVIKA` },
      { name: "description", content: "Handcrafted hair accessory by MIRAVIKA." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product, isLoading } = useProduct(handle);
  const { data: related = [] } = useProducts(undefined, 8);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const isLoadingCart = useCartStore((s) => s.isLoading);
  const wished = useWishlistStore((s) => s.has(handle));
  const toggleWish = useWishlistStore((s) => s.toggle);

  const variant = useMemo(() => {
    if (!product) return null;
    const variants = product.variants.edges.map((e) => e.node);
    if (Object.keys(selected).length === 0) return variants[0];
    return (
      variants.find((v) =>
        v.selectedOptions.every((o) => !selected[o.name] || selected[o.name] === o.value),
      ) ?? variants[0]
    );
  }, [product, selected]);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
        <div className="aspect-square animate-pulse rounded-md bg-beige" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-beige" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-beige" />
          <div className="h-24 animate-pulse rounded bg-beige" />
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Product not found</h1>
        <Link to="/shop" className="mt-6 inline-block text-xs uppercase tracking-[0.18em] underline-offset-4 hover:underline">← Back to shop</Link>
      </div>
    );
  }

  const images = product.images.edges;
  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: qty,
      selectedOptions: variant.selectedOptions,
    });
    toast.success("Added to bag", { position: "top-center" });
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-14">
      <div className="grid gap-8 md:grid-cols-2 md:gap-14">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-md bg-beige">
            {images[activeImg] && (
              <img src={images[activeImg].node.url} alt={images[activeImg].node.altText ?? product.title} className="h-full w-full object-cover" />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.node.url}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden rounded ${i === activeImg ? "ring-2 ring-gold" : "ring-1 ring-border"}`}
                >
                  <img src={img.node.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">MIRAVIKA</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{product.title}</h1>
          <p className="mt-3 font-display text-2xl">
            {variant ? formatPrice(variant.price.amount, variant.price.currencyCode) : formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes. Free shipping ₹999+.</p>

          {product.description && (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          {/* Options */}
          {product.options.filter((o) => o.values.length > 1 || o.name !== "Title").map((opt) => (
            <div key={opt.name} className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{opt.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {opt.values.map((v) => {
                  const active = (selected[opt.name] ?? variant?.selectedOptions.find((o) => o.name === opt.name)?.value) === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setSelected((s) => ({ ...s, [opt.name]: v }))}
                      className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition ${active ? "border-foreground bg-foreground text-ivory" : "border-border hover:border-foreground"}`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Qty + CTA */}
          <div className="mt-7 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center hover:text-gold"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center hover:text-gold"><Plus className="h-4 w-4" /></button>
            </div>
            <Button onClick={handleAdd} disabled={isLoadingCart || !variant?.availableForSale} size="lg" className="h-11 flex-1 rounded-full bg-foreground text-ivory hover:bg-foreground/90">
              {isLoadingCart ? <Loader2 className="h-4 w-4 animate-spin" /> : variant?.availableForSale ? "Add to Bag" : "Sold Out"}
            </Button>
            <button onClick={() => toggleWish(handle)} aria-label="Wishlist" className="grid h-11 w-11 place-items-center rounded-full border border-border hover:border-gold">
              <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : ""}`} />
            </button>
          </div>

          {/* Trust */}
          <div className="mt-6 grid grid-cols-3 gap-3 rounded-md border border-border/60 bg-beige/30 p-4 text-center">
            <div><Truck className="mx-auto mb-1 h-4 w-4 text-gold" /><p className="text-[10px] uppercase tracking-wider">Free over ₹999</p></div>
            <div><Undo2 className="mx-auto mb-1 h-4 w-4 text-gold" /><p className="text-[10px] uppercase tracking-wider">7-day returns</p></div>
            <div><ShieldCheck className="mx-auto mb-1 h-4 w-4 text-gold" /><p className="text-[10px] uppercase tracking-wider">COD India</p></div>
          </div>

          {/* Details */}
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="materials">
              <AccordionTrigger className="text-sm">Materials & Care</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Premium silk and satin with hand-finished brass detailing. Spot clean with cold water. Store flat away from sunlight.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-sm">Shipping & Returns</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Dispatched within 24-48 hours. Delivered in 3-7 business days across India. 7-day easy return on unused items.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="reviews">
              <AccordionTrigger className="text-sm">Reviews</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                No reviews yet. Be the first to share once you've received your piece.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related */}
      {related.length > 1 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl md:text-3xl">You may also love</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {related.filter((p) => p.node.handle !== handle).slice(0, 4).map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
