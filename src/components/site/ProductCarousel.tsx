import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import type { FrontendProduct } from "@/lib/nexus-product";

/**
 * Editorial horizontal carousel for a live Shopify collection.
 * Snap-scroll on mobile, arrow controls on desktop, staggered reveal on entry.
 */
export function ProductCarousel({
  eyebrow,
  title,
  subtitle,
  slug,
  products,
  isLoading,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  slug: string;
  products: FrontendProduct[];
  isLoading?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    sync();
  }, [sync, products.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="mb-6 flex items-end justify-between gap-4 md:mb-8">
          <div>
            {eyebrow && (
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold">{eyebrow}</p>
            )}
            <h2 className="mt-2 font-display text-2xl md:text-4xl">{title}</h2>
            {subtitle && <p className="mt-2 max-w-md text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/collection/$slug"
              params={{ slug }}
              className="hidden text-[11px] uppercase tracking-[0.18em] text-foreground/70 underline-offset-4 transition hover:text-gold hover:underline md:inline"
            >
              View All
            </Link>
            <div className="hidden gap-2 md:flex">
              <button
                onClick={() => scrollBy(-1)}
                disabled={atStart}
                aria-label={`Previous ${title} products`}
                className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:border-gold hover:text-gold disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => scrollBy(1)}
                disabled={atEnd}
                aria-label={`Next ${title} products`}
                className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:border-gold hover:text-gold disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </Reveal>

        <div
          ref={trackRef}
          onScroll={sync}
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:gap-6 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[46%] shrink-0 snap-start md:w-[calc((100%-4.5rem)/4)]">
                  <div className="aspect-[4/5] animate-pulse rounded-xl bg-beige" />
                </div>
              ))
            : products.map((p, i) => (
                <Reveal
                  key={p.id}
                  delay={Math.min(i, 5) * 70}
                  className="w-[46%] shrink-0 snap-start md:w-[calc((100%-4.5rem)/4)]"
                >
                  <ProductCard product={p} />
                </Reveal>
              ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            to="/collection/$slug"
            params={{ slug }}
            className="inline-block rounded-full border border-foreground/20 px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] transition hover:border-gold hover:text-gold"
          >
            View All {title}
          </Link>
        </div>
      </div>
    </section>
  );
}
