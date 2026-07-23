import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Heart, Loader2, Minus, Plus, ShieldCheck, Truck, Undo2, Share2 } from "lucide-react";
import { useProduct, useCollection } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useRecordView, useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProductCard } from "@/components/site/ProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProducts } from "@/hooks/useProducts";

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => {
    const readable = titleCase(params.handle);
    const url = `https://miravika-lumina-core.lovable.app/product/${params.handle}`;
    // Unique description per product handle so no two PDPs share the same meta description
    const description = `Shop ${readable} at MIRAVIKA — a curated piece from our premium global lifestyle edit. Worldwide shipping, 7-day easy returns and Cash on Delivery across India.`;
    return {
      meta: [
        { title: `${readable} | MIRAVIKA` },
        { name: "description", content: description },
        { property: "og:title", content: `${readable} — MIRAVIKA` },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${readable} — MIRAVIKA` },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://miravika-lumina-core.lovable.app/" },
              { "@type": "ListItem", position: 2, name: "Shop", item: "https://miravika-lumina-core.lovable.app/shop" },
              { "@type": "ListItem", position: 3, name: readable, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product, isLoading } = useProduct(handle);
  const { data: bestSellers } = useCollection("best-sellers", 8);
  const { data: recentProducts = [] } = useProducts(undefined, 30);

  useRecordView(handle);
  const { handles: recentHandles } = useRecentlyViewed(handle);

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const isLoadingCart = useCartStore((s) => s.isLoading);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const wished = useWishlistStore((s) => s.has(handle));
  const toggleWish = useWishlistStore((s) => s.toggle);

  useEffect(() => { setActiveImg(0); }, [handle]);

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

  const compareAmt = variant?.compareAtPrice?.amount ? parseFloat(variant.compareAtPrice.amount) : null;
  const priceAmt = variant ? parseFloat(variant.price.amount) : 0;
  const onSale = compareAmt !== null && compareAmt > priceAmt;

  // Recently-viewed products list
  const recentlyViewed = useMemo(
    () => recentHandles.map((h) => recentProducts.find((p) => p.node.handle === h)).filter(Boolean).slice(0, 4),
    [recentHandles, recentProducts],
  );

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
        <div className="aspect-square animate-pulse rounded-md bg-beige" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-beige" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-beige" />
          <div className="h-24 animate-pulse rounded bg-beige" />
          <div className="h-12 w-full animate-pulse rounded-full bg-beige" />
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Product not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">The piece you're looking for may have moved or sold out.</p>
        <Link to="/shop" className="mt-8 inline-block rounded-full bg-noir px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-ivory hover:bg-foreground/85">
          Continue Shopping
        </Link>
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

  const handleBuyNow = async () => {
    await handleAdd();
    // Wait a tick for cart state, then open checkout
    setTimeout(() => {
      const url = getCheckoutUrl();
      if (url) window.open(url, "_blank");
    }, 300);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title: product.title, url }); } catch { /* noop */ }
    } else {
      navigator.clipboard?.writeText(url);
      toast.success("Link copied");
    }
  };

  const marketplaces = (() => {
    const tags = (product.tags ?? []).map((t) => t.toLowerCase());
    return [
      { key: "amazon", label: "Buy on Amazon", url: `https://www.amazon.in/s?k=${encodeURIComponent(product.title + " Miravika")}` },
      { key: "flipkart", label: "Buy on Flipkart", url: `https://www.flipkart.com/search?q=${encodeURIComponent(product.title + " Miravika")}` },
      { key: "meesho", label: "Buy on Meesho", url: `https://www.meesho.com/search?q=${encodeURIComponent(product.title + " Miravika")}` },
    ].filter((m) => tags.includes(`marketplace:${m.key}`) || tags.includes(m.key));
  })();

  // Related & FBT sources
  const related = (bestSellers?.products ?? recentProducts).filter((p) => p.node.handle !== handle).slice(0, 4);
  const fbt = related.slice(0, 3);

  // GMC / Performance Max friendly Product schema (rendered at document head via useEffect below)
  const priceValidUntil = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  })();
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    description: (product.description || "A signature MIRAVIKA piece — premium materials, considered design.").slice(0, 5000),
    image: images.map((i) => i.node.url),
    sku: variant?.id?.split("/").pop() ?? handle,
    mpn: handle,
    productID: `shopify_IN_${handle}`,
    brand: { "@type": "Brand", name: "MIRAVIKA" },
    category: product.productType ?? "Fashion & Lifestyle",
    url: `https://miravika-lumina-core.lovable.app/product/${handle}`,
    offers: {
      "@type": "Offer",
      priceCurrency: variant?.price.currencyCode ?? "INR",
      price: priceAmt.toFixed(2),
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
      availability: variant?.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://miravika-lumina-core.lovable.app/product/${handle}`,
      seller: { "@type": "Organization", name: "MIRAVIKA" },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: variant?.price.currencyCode ?? "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
        },
      },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />


      <div className="mx-auto max-w-7xl px-4 py-6 pb-24 md:py-12 md:pb-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <Link to="/" className="hover:text-gold">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-gold">Shop</Link>
          <span className="mx-2">/</span>
          <span className="line-clamp-1 inline-block max-w-[240px] align-bottom text-foreground/80">{product.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-14">
          {/* Gallery */}
          <div>
            <div className="aspect-square overflow-hidden rounded-lg bg-beige">
              {images[activeImg] && (
                <img
                  src={images[activeImg].node.url}
                  alt={images[activeImg].node.altText ?? product.title}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.slice(0, 10).map((img, i) => (
                  <button
                    key={img.node.url}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`aspect-square overflow-hidden rounded transition ${
                      i === activeImg ? "ring-2 ring-gold" : "ring-1 ring-border hover:ring-foreground/40"
                    }`}
                  >
                    <img src={img.node.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:pl-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-gold">MIRAVIKA</p>
            <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{product.title}</h1>

            <div className="mt-4 flex items-baseline gap-3">
              <p className="font-display text-2xl">
                {formatPrice(priceAmt, variant?.price.currencyCode ?? "INR")}
              </p>
              {onSale && compareAmt && (
                <>
                  <p className="text-lg text-muted-foreground line-through">
                    {formatPrice(compareAmt, variant?.price.currencyCode ?? "INR")}
                  </p>
                  <span className="rounded-sm bg-noir px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ivory">
                    Save {Math.round((1 - priceAmt / compareAmt) * 100)}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Inclusive of all taxes · Free shipping on orders ₹2999+
            </p>

            {/* Options */}
            {product.options.filter((o) => o.values.length > 1 || o.name !== "Title").map((opt) => (
              <div key={opt.name} className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {opt.name}: <span className="text-foreground">{selected[opt.name] ?? variant?.selectedOptions.find((o) => o.name === opt.name)?.value}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {opt.values.map((v) => {
                    const active = (selected[opt.name] ?? variant?.selectedOptions.find((o) => o.name === opt.name)?.value) === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setSelected((s) => ({ ...s, [opt.name]: v }))}
                        className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition ${
                          active ? "border-foreground bg-foreground text-ivory" : "border-border bg-ivory hover:border-foreground"
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Qty + CTAs (desktop) */}
            <div className="mt-7 hidden items-center gap-3 md:flex">
              <div className="flex items-center rounded-full border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" className="grid h-11 w-11 place-items-center hover:text-gold"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase" className="grid h-11 w-11 place-items-center hover:text-gold"><Plus className="h-4 w-4" /></button>
              </div>
              <Button
                onClick={handleAdd}
                disabled={isLoadingCart || !variant?.availableForSale}
                size="lg"
                className="h-11 flex-1 rounded-full bg-foreground text-[11px] uppercase tracking-[0.22em] text-ivory hover:bg-foreground/90"
              >
                {isLoadingCart ? <Loader2 className="h-4 w-4 animate-spin" /> : variant?.availableForSale ? "Add to Bag" : "Sold Out"}
              </Button>
              <button
                onClick={() => toggleWish(handle)}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="grid h-11 w-11 place-items-center rounded-full border border-border hover:border-gold"
              >
                <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : ""}`} strokeWidth={1.5} />
              </button>
            </div>

            <Button
              onClick={handleBuyNow}
              disabled={isLoadingCart || !variant?.availableForSale}
              variant="outline"
              size="lg"
              className="mt-3 hidden h-11 w-full rounded-full border-foreground/30 text-[11px] uppercase tracking-[0.22em] hover:border-gold hover:text-gold md:inline-flex"
            >
              Buy It Now
            </Button>

            <button onClick={handleShare} className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-gold">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>

            {/* Marketplaces */}
            {marketplaces.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Also available on</p>
                <div className={`grid gap-2 ${marketplaces.length === 1 ? "grid-cols-1" : marketplaces.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {marketplaces.map((m) => (
                    <a
                      key={m.key}
                      href={m.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center justify-center rounded-full border border-border bg-ivory px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] hover:border-gold hover:text-gold"
                    >
                      {m.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Trust */}
            <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg border border-border/60 bg-beige/40 p-4 text-center">
              <div><Truck className="mx-auto mb-1 h-4 w-4 text-gold" /><p className="text-[10px] uppercase tracking-wider">Free ₹2999+</p></div>
              <div><Undo2 className="mx-auto mb-1 h-4 w-4 text-gold" /><p className="text-[10px] uppercase tracking-wider">7-day returns</p></div>
              <div><ShieldCheck className="mx-auto mb-1 h-4 w-4 text-gold" /><p className="text-[10px] uppercase tracking-wider">Secure · COD</p></div>
            </div>

            {/* Details */}
            <Accordion type="single" collapsible defaultValue="details" className="mt-6">
              <AccordionItem value="details">
                <AccordionTrigger className="text-[11px] uppercase tracking-[0.18em]">Description</AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.description || "A signature Miravika piece — crafted from premium materials and finished by hand."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-[11px] uppercase tracking-[0.18em]">Shipping & Delivery</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Dispatched within 24–48 hours from our warehouse.</li>
                    <li>India: 3–7 business days · Worldwide: 7–14 business days.</li>
                    <li>Free shipping on orders ₹2,999+ (India) and $49+ (International).</li>
                    <li>Cash on Delivery available across India.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="text-[11px] uppercase tracking-[0.18em]">Returns & Care</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  7-day easy returns on unused items in original packaging. Store your Miravika piece in the provided box away from moisture, direct sunlight and chemicals to preserve its finish.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="reviews">
                <AccordionTrigger className="text-[11px] uppercase tracking-[0.18em]">Reviews</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  No reviews yet. Be the first to share your Miravika moment.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* FREQUENTLY BOUGHT TOGETHER */}
        {fbt.length >= 2 && (
          <section className="mt-20 border-t border-border/50 pt-14">
            <div className="mb-8 text-center">
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Complete the Look</p>
              <h2 className="mt-2 font-display text-2xl md:text-3xl">Frequently Bought Together</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
              {fbt.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* RECENTLY VIEWED */}
        {recentlyViewed.length > 0 && (
          <section className="mt-20 border-t border-border/50 pt-14">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Your Journey</p>
                <h2 className="mt-2 font-display text-2xl md:text-3xl">Recently Viewed</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
              {recentlyViewed.map((p) => p && <ProductCard key={p.node.id} product={p} />)}
            </div>
          </section>
        )}

        {/* RELATED */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-border/50 pt-14">
            <div className="mb-8 text-center">
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold">You may also love</p>
              <h2 className="mt-2 font-display text-2xl md:text-3xl">More From the Boutique</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MOBILE STICKY BUY BAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-ivory/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="min-w-0 flex-shrink">
            <p className="line-clamp-1 text-[11px] font-medium">{product.title}</p>
            <p className="text-[13px] font-display">
              {formatPrice(priceAmt, variant?.price.currencyCode ?? "INR")}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => toggleWish(handle)}
              aria-label="Wishlist"
              className="grid h-10 w-10 place-items-center rounded-full border border-border"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : ""}`} strokeWidth={1.5} />
            </button>
            <Button
              onClick={handleAdd}
              disabled={isLoadingCart || !variant?.availableForSale}
              className="h-10 rounded-full bg-foreground px-6 text-[11px] uppercase tracking-[0.2em] text-ivory hover:bg-foreground/90"
            >
              {isLoadingCart ? <Loader2 className="h-4 w-4 animate-spin" /> : variant?.availableForSale ? "Add to Bag" : "Sold Out"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
