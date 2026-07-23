import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — MIRAVIKA" },
      { name: "description", content: "The MIRAVIKA pieces you've saved for later." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const handles = useWishlistStore((s) => s.handles);
  const { data: products = [] } = useProducts(undefined, 100);
  const items = products.filter((p) => handles.includes(p.node.handle));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <h1 className="font-display text-3xl md:text-5xl">Wishlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">{items.length} saved</p>
      {items.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border/70 bg-beige/30 p-12 text-center">
          <Heart className="mx-auto mb-3 h-8 w-8 text-gold" />
          <h3 className="font-display text-xl">Your wishlist is empty</h3>
          <Link to="/shop" className="mt-4 inline-block text-xs uppercase tracking-[0.18em] underline-offset-4 hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {items.map((p) => <ProductCard key={p.node.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
