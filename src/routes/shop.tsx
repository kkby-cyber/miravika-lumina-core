import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — MIRAVIKA" },
      { name: "description", content: "Shop the entire MIRAVIKA boutique — fashion, jewelry, beauty and home essentials, curated for the modern woman." },
      { property: "og:title", content: "Shop All — MIRAVIKA" },
      { property: "og:description", content: "The full Miravika edit — fashion, jewelry, beauty and home." },
      { property: "og:url", content: "https://miravika-lumina-core.lovable.app/shop" },
    ],
    links: [{ rel: "canonical", href: "https://miravika-lumina-core.lovable.app/shop" }],
  }),
  component: Shop,
});

function Shop() {
  const { data: products = [], isLoading } = useProducts(undefined, 100);
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "title">("featured");

  const sorted = useMemo(() => {
    const arr = [...products];
    if (sort === "price-asc") arr.sort((a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
    if (sort === "price-desc") arr.sort((a, b) => parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount));
    if (sort === "title") arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  }, [products, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">The Boutique</p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl">Shop Everything</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Every piece from the Miravika world — curated across fashion, jewelry, beauty and home.
        </p>
        <div className="mx-auto mt-5 h-px w-16 gold-line" />
      </header>

      <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
        <span className="text-xs text-muted-foreground">{sorted.length} items</span>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Sort products"
            className="appearance-none rounded-full border border-border bg-ivory px-4 py-2 pr-9 text-[11px] uppercase tracking-[0.18em]"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="title">A → Z</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-md bg-beige" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-beige/40 p-14 text-center">
          <h3 className="font-display text-2xl">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first product through Shopify admin, and it will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {sorted.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
