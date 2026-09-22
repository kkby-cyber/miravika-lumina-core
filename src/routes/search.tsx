import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";
import { formatPrice } from "@/lib/format-price";
import { itemFromProduct, trackSearch, trackViewItemList } from "@/lib/analytics";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — MIRAVIKA" },
      { name: "description", content: "Search the MIRAVIKA boutique." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

const POPULAR = [
  { label: "Signature Collection", slug: "signature-collection" },
  { label: "New Arrivals", slug: "new-arrivals" },
  { label: "Ready-to-Wear", slug: "ready-to-wear" },
  { label: "Curated Sets", slug: "curated-sets" },
];

function SearchPage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const { data: products = [], isLoading } = useProducts(undefined, 100);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 150);
    return () => clearTimeout(t);
  }, [q]);

  const results = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    if (!term) return [];
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.productType?.toLowerCase().includes(term) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(term)),
    );
  }, [products, debounced]);

  useEffect(() => {
    const term = debounced.trim();
    if (!term) return;
    trackSearch(term, results.length);
    if (results.length) {
      trackViewItemList(
        results.slice(0, 20).map((p, i) => itemFromProduct(p, { index: i })),
        "search_results",
        `Search: ${term}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, results.length]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Search</p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl">What are you looking for?</h1>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3.5 shadow-sm focus-within:border-gold">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search necklaces, earrings, dresses, home…"
            aria-label="Search products"
            className="w-full bg-transparent text-sm outline-none"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear"
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-beige"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {!debounced && (
          <div className="mt-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Popular</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {POPULAR.map((p) => (
                <Link
                  key={p.label}
                  to="/collection/$slug"
                  params={{ slug: p.slug }}
                  className="rounded-full border border-border px-4 py-2 text-xs hover:border-gold hover:text-gold"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {debounced && (
        <>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            {isLoading
              ? "Searching…"
              : `${results.length} result${results.length === 1 ? "" : "s"} for "${debounced}"`}
          </p>

          {/* Predictive image preview strip (top 4) */}
          {results.length > 0 && (
            <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
              {results.slice(0, 4).map((p) => {
                const img = p.images.edges[0]?.node;
                return (
                  <Link
                    key={p.id}
                    to="/product/$handle"
                    params={{ handle: p.handle }}
                    className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2 transition hover:border-gold"
                  >
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-beige">
                      {img && (
                        <img
                          src={img.url}
                          alt={img.altText ?? p.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-medium group-hover:text-gold">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatPrice(
                          p.priceRange.minVariantPrice.amount,
                          p.priceRange.minVariantPrice.currencyCode,
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {results.length === 0 && !isLoading && (
            <div className="mx-auto mt-10 max-w-md rounded-lg border border-dashed border-border/70 bg-beige/40 p-10 text-center">
              <h3 className="font-display text-xl">No matches</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different term, or explore our collections.
              </p>
              <Link
                to="/shop"
                className="mt-5 inline-block rounded-full bg-noir px-6 py-2.5 text-[11px] uppercase tracking-[0.22em] text-ivory hover:bg-foreground/85"
              >
                Shop All
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
