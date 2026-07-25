import { Quote } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useShopRatings } from "@/hooks/useReviews";
import { Stars } from "@/components/site/Stars";

/**
 * Genuine customer testimonials, sourced from published, verified reviews only.
 * Renders nothing when there are no real reviews yet — never fabricated copy.
 */
export function Testimonials() {
  const { data } = useShopRatings();
  const featured = (data?.featured ?? []).filter((r) => r.body.trim().length > 40).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="border-y border-border/50 bg-beige/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold">In their words</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Loved by our customers</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-7">
          {featured.map((r) => (
            <figure key={r.id} className="rounded-lg border border-border/60 bg-ivory p-6">
              <Quote className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <Stars rating={r.rating} size={13} className="mt-3" />
              <blockquote className="mt-3 line-clamp-6 text-sm leading-relaxed text-muted-foreground">
                {r.body}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
                <span>{r.reviewerName}</span>
                {r.verifiedBuyer && <span className="text-gold">· Verified Buyer</span>}
              </figcaption>
              {r.productHandle && (
                <Link
                  to="/product/$handle"
                  params={{ handle: r.productHandle }}
                  className="mt-3 inline-block text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
                >
                  Shop the piece
                </Link>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Real customer photos pulled from published photo reviews. */
export function CustomerGallery() {
  const { data } = useShopRatings();
  const photos = (data?.featured ?? []).flatMap((r) =>
    r.pictures.map((url) => ({ url, handle: r.productHandle, name: r.reviewerName })),
  ).slice(0, 8);
  if (photos.length < 4) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Real customers</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">MIRAVIKA in real life</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {photos.map((p, i) =>
            p.handle ? (
              <Link
                key={`${p.url}-${i}`}
                to="/product/$handle"
                params={{ handle: p.handle }}
                className="aspect-square overflow-hidden rounded-md bg-beige"
              >
                <img
                  src={p.url}
                  alt={`Customer photo from ${p.name}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </Link>
            ) : (
              <div key={`${p.url}-${i}`} className="aspect-square overflow-hidden rounded-md bg-beige">
                <img
                  src={p.url}
                  alt={`Customer photo from ${p.name}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
