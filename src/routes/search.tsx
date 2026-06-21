import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — MIRAVIKA" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const { data: products = [], isLoading } = useProducts(undefined, 100);
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) => p.node.title.toLowerCase().includes(term) || p.node.description?.toLowerCase().includes(term) || p.node.tags?.some((t) => t.toLowerCase().includes(term)),
    );
  }, [products, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <h1 className="font-display text-3xl md:text-5xl">Search</h1>
      <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for scrunchies, bows, clips…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{isLoading ? "Loading…" : `${results.length} results`}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {results.map((p) => (
          <ProductCard key={p.node.id} product={p} />
        ))}
      </div>
    </div>
  );
}
