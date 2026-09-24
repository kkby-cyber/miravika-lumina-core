import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { syncCustomerWishlist } from "@/lib/customer-wishlist-sync";
import { getNexusProduct } from "@/lib/nexus";
import { toFrontendProduct, type FrontendProduct } from "@/lib/nexus-product";
import { useWishlistStore } from "@/stores/wishlistStore";

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
  const entries = useWishlistStore((s) => s.entries);
  const [items, setItems] = useState<
    Array<{ product: FrontendProduct; variantId: string | null }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        await syncCustomerWishlist();

        const currentEntries = [...useWishlistStore.getState().entries];
        const currentHandles = [...new Set(currentEntries.map((entry) => entry.handle))];

        const results = await Promise.all(
          currentHandles.map(async (handle) => {
            try {
              const data = await getNexusProduct(handle);
              return data.product ? toFrontendProduct(data.product) : null;
            } catch {
              return null;
            }
          }),
        );

        if (!cancelled) {
          const products = new Map(
            results
              .filter((product): product is FrontendProduct => product !== null)
              .map((product) => [product.handle, product]),
          );

          setItems(
            currentEntries.flatMap((entry) => {
              const product = products.get(entry.handle);
              return product ? [{ product, variantId: entry.variantId }] : [];
            }),
          );
        }
      } catch (error) {
        console.error("Wishlist page load failed:", error);

        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const visibleEntries = new Set(
      entries.map((entry) => `${entry.handle}::${entry.variantId ?? "product"}`),
    );

    setItems((current) =>
      current.filter((item) =>
        visibleEntries.has(
          `${item.product.handle}::${item.variantId ?? "product"}`,
        ),
      ),
    );
  }, [entries, loading]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <h1 className="font-display text-3xl md:text-5xl">Wishlist</h1>

      <p className="mt-2 text-sm text-muted-foreground">
        {loading ? "Loading your saved pieces…" : `${items.length} saved`}
      </p>

      {loading ? (
        <div className="mt-10 flex min-h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border/70 bg-beige/30 p-12 text-center">
          <Heart className="mx-auto mb-3 h-8 w-8 text-gold" />
          <h3 className="font-display text-xl">Your wishlist is empty</h3>
          <Link
            to="/shop"
            className="mt-4 inline-block text-xs uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {items.map(({ product, variantId }) => (
            <ProductCard
              key={`${product.id}-${variantId ?? "product"}`}
              product={product}
              variantId={variantId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
