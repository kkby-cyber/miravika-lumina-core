import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — MIRAVIKA" },
      { name: "description", content: "Shop all MIRAVIKA hair accessories. Scrunchies, bows, clips, bands and more." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { data: products = [], isLoading } = useProducts(undefined, 100);
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "title">("featured");

  const sorted = useMemo(() => {
    const arr = [...products];
    if (sort === "price-asc") arr.sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount));
    if (sort === "price-desc") arr.sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount));
    if (sort === "title") arr.sort((a, b) => a.node.title.localeCompare(b.node.title));
    return arr;
  }, [products, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Shop</p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl">All Accessories</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{sorted.length} items</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-border bg-card px-4 py-2 text-xs uppercase tracking-wider"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="title">A → Z</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-md bg-beige" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 bg-beige/30 p-12 text-center">
          <h3 className="font-display text-2xl">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first product through the Lovable chat (name + price) or open the Shopify admin to create it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {sorted.map((p) => (
            <ProductCard key={p.node.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
