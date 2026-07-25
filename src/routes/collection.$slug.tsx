import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useCollection, useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";
import { resolveCollectionHandle } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";
import { itemFromProduct, trackViewItemList } from "@/lib/analytics";
import { useShopRatings } from "@/hooks/useReviews";


// Fallback friendly copy for known handles
const HANDLE_COPY: Record<string, { title: string; sub: string }> = {
  "new-arrivals": { title: "New Arrivals", sub: "Fresh from the ateliers — the newest additions to the Miravika boutique." },
  "best-sellers": { title: "Best Sellers", sub: "The pieces our community can't get enough of." },
  "womens-fashion": { title: "Women's Fashion", sub: "Ready-to-wear, elevated for every day and every occasion." },
  "jewelry-accessories": { title: "Jewelry & Accessories", sub: "Sterling silver, moissanite and heirloom-inspired pieces." },
  "beauty-personal-care": { title: "Beauty & Personal Care", sub: "Skincare, tools and ritual essentials — curated for the modern woman." },
  "home-kitchen": { title: "Home & Kitchen", sub: "Thoughtful essentials that elevate every corner of your home." },
  "electronics-accessories": { title: "Electronics & Accessories", sub: "Smart, sleek gadgets designed to simplify your day." },
  "gifts": { title: "Gifts", sub: "Considered gifting for every occasion." },
  "trending-now": { title: "Trending Now", sub: "What's moving fast, worldwide." },
};

export const Route = createFileRoute("/collection/$slug")({
  head: ({ params }) => {
    const handle = resolveCollectionHandle(params.slug);
    const copy = HANDLE_COPY[handle] ?? { title: params.slug.replace(/-/g, " "), sub: "Curated by Miravika." };
    // Canonicalize to the resolved handle so legacy slug variants never create duplicate content
    const canonical = `https://miravika-lumina-core.lovable.app/collection/${handle}`;
    return {
      meta: [
        { title: `${copy.title} — Shop the Edit | MIRAVIKA` },
        { name: "description", content: copy.sub },
        { property: "og:title", content: `${copy.title} — MIRAVIKA` },
        { property: "og:description", content: copy.sub },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${copy.title} — MIRAVIKA` },
        { name: "twitter:description", content: copy.sub },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://miravika-lumina-core.lovable.app/" },
              { "@type": "ListItem", position: 2, name: "Shop", item: "https://miravika-lumina-core.lovable.app/shop" },
              { "@type": "ListItem", position: 3, name: copy.title, item: canonical },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${copy.title} — MIRAVIKA`,
            description: copy.sub,
            url: canonical,
            isPartOf: {
              "@type": "WebSite",
              name: "MIRAVIKA",
              url: "https://miravika-lumina-core.lovable.app/",
            },
          }),
        },
      ],
    };
  },
  component: CollectionPage,
});

type Sort = "featured" | "price-asc" | "price-desc" | "title" | "rating";
type PriceBand = "all" | "under-2500" | "2500-7500" | "7500-15000" | "over-15000";

function CollectionPage() {
  const { slug } = Route.useParams();
  const handle = resolveCollectionHandle(slug);
  const copy = HANDLE_COPY[handle] ?? { title: slug.replace(/-/g, " "), sub: "" };

  const { data: collection, isLoading: colLoading } = useCollection(handle, 100);
  // Fallback to tag search if collection is empty / unknown
  const { data: fallback = [], isLoading: fbLoading } = useProducts(
    !colLoading && (!collection || collection.products.length === 0) ? slug : undefined,
    100,
  );

  const source: ShopifyProduct[] = collection?.products?.length ? collection.products : fallback;
  const isLoading = colLoading || fbLoading;

  const [sort, setSort] = useState<Sort>("featured");
  const [band, setBand] = useState<PriceBand>("all");
  const [inStock, setInStock] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: shopRatings } = useShopRatings();

  // Category options come from the real Shopify product types inside this collection
  const categories = useMemo(() => {
    const set = new Set<string>();
    source.forEach((p) => p.node.productType && set.add(p.node.productType));
    return [...set].sort();
  }, [source]);

  useEffect(() => {
    setCategory("all");
  }, [handle]);

  const filtered = useMemo(() => {
    let arr = [...source];
    if (inStock) arr = arr.filter((p) => p.node.variants.edges.some((v) => v.node.availableForSale));
    if (category !== "all") arr = arr.filter((p) => p.node.productType === category);
    if (band !== "all") {
      arr = arr.filter((p) => {
        const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
        if (band === "under-2500") return price < 2500;
        if (band === "2500-7500") return price >= 2500 && price < 7500;
        if (band === "7500-15000") return price >= 7500 && price < 15000;
        if (band === "over-15000") return price >= 15000;
        return true;
      });
    }
    if (sort === "price-asc") arr.sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount));
    if (sort === "price-desc") arr.sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount));
    if (sort === "title") arr.sort((a, b) => a.node.title.localeCompare(b.node.title));
    if (sort === "rating") {
      const score = (h: string) => shopRatings?.ratings?.[h]?.average ?? -1;
      arr.sort((a, b) => score(b.node.handle) - score(a.node.handle));
    }
    return arr;
  }, [source, sort, band, inStock, category, shopRatings]);


  useEffect(() => {
    if (!filtered.length) return;
    trackViewItemList(
      filtered.slice(0, 24).map((p, i) => itemFromProduct(p.node, { index: i })),
      handle,
      copy.title,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, filtered.length]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <Link to="/" className="hover:text-gold">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-gold">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground/80">{copy.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 border-b border-border/60 pb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Collection</p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl">{copy.title}</h1>
        {copy.sub && <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">{copy.sub}</p>}
        <div className="mx-auto mt-5 h-px w-16 gold-line" />
      </header>

      <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-10">
        {/* SIDEBAR */}
        <aside className={`${filtersOpen ? "fixed inset-0 z-50 overflow-y-auto bg-ivory p-6" : "hidden"} md:static md:block md:p-0`}>
          {filtersOpen && (
            <div className="mb-6 flex items-center justify-between md:hidden">
              <h3 className="font-display text-2xl">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-full hover:bg-beige">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-gold">Availability</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-foreground" />
              In stock only
            </label>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-gold">Price</p>
            <div className="flex flex-col gap-2 text-sm">
              {([
                ["all", "All prices"],
                ["under-2500", "Under ₹2,500"],
                ["2500-7500", "₹2,500 – ₹7,500"],
                ["7500-15000", "₹7,500 – ₹15,000"],
                ["over-15000", "Over ₹15,000"],
              ] as [PriceBand, string][]).map(([v, l]) => (
                <label key={v} className="flex items-center gap-2">
                  <input type="radio" name="band" checked={band === v} onChange={() => setBand(v)} className="accent-foreground" />
                  {l}
                </label>
              ))}
            </div>
          </div>
          {categories.length > 1 && (
            <div className="mt-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-gold">Category</p>
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="category" checked={category === "all"} onChange={() => setCategory("all")} className="accent-foreground" />
                  All categories
                </label>
                {categories.map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input type="radio" name="category" checked={category === c} onChange={() => setCategory(c)} className="accent-foreground" />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          )}

          {filtersOpen && (
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-8 w-full rounded-full bg-noir py-3 text-[11px] uppercase tracking-[0.22em] text-ivory md:hidden"
            >
              Show {filtered.length} items
            </button>
          )}
        </aside>

        {/* GRID */}
        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] md:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>
            <span className="hidden text-xs text-muted-foreground md:inline">{filtered.length} items</span>
            <span className="text-xs text-muted-foreground md:hidden">{filtered.length}</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label="Sort products"
                className="appearance-none rounded-full border border-border bg-ivory px-4 py-2 pr-9 text-[11px] uppercase tracking-[0.18em]"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="title">A → Z</option>
                <option value="rating">Top Rated</option>

              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-md bg-beige" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 bg-beige/40 p-16 text-center">
              <h3 className="font-display text-2xl">Nothing matches — yet</h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Try clearing filters, or explore the boutique for our full curation.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => { setBand("all"); setInStock(false); }}
                  className="rounded-full border border-foreground/20 px-6 py-2.5 text-[11px] uppercase tracking-[0.22em] hover:border-gold hover:text-gold"
                >
                  Clear filters
                </button>
                <Link to="/shop" className="rounded-full bg-noir px-6 py-2.5 text-[11px] uppercase tracking-[0.22em] text-ivory hover:bg-foreground/85">
                  Shop All
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
              {filtered.map((p, i) => (
                <ProductCard key={p.node.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
