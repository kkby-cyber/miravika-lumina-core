import { createFileRoute } from "@tanstack/react-router";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";

const TITLES: Record<string, { title: string; sub: string; query: string }> = {
  scrunchies: { title: "Hair Scrunchies", sub: "Silk-soft, all-day hold", query: "tag:scrunchies OR product_type:Scrunchies OR title:scrunchie" },
  bows: { title: "Hair Bows", sub: "Romance, tied up", query: "tag:bows OR product_type:Bows OR title:bow" },
  clips: { title: "Hair Clips", sub: "Sculptural shine", query: "tag:clips OR product_type:Clips OR title:clip" },
  bands: { title: "Hair Bands", sub: "Quiet drama", query: "tag:bands OR product_type:Bands OR title:band" },
  accessories: { title: "Accessories", sub: "Finishing touches", query: "tag:accessories OR product_type:Accessories" },
};

export const Route = createFileRoute("/collection/$slug")({
  head: ({ params }) => {
    const meta = TITLES[params.slug] ?? { title: params.slug, sub: "", query: params.slug };
    return {
      meta: [
        { title: `${meta.title} — MIRAVIKA` },
        { name: "description", content: `${meta.title} by MIRAVIKA. ${meta.sub}` },
      ],
    };
  },
  component: Collection,
});

function Collection() {
  const { slug } = Route.useParams();
  const meta = TITLES[slug] ?? { title: slug, sub: "", query: slug };
  const { data: products = [], isLoading } = useProducts(meta.query, 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <div className="mb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Collection</p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl">{meta.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{meta.sub}</p>
        <div className="mx-auto mt-5 h-px w-24 gold-line" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-md bg-beige" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 bg-beige/30 p-12 text-center">
          <h3 className="font-display text-2xl">Coming soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We're crafting this drop. Check back shortly — or shop everything in the meantime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.node.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
