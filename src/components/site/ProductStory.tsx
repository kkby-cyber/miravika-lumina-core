import { CalendarCheck, Gem, Package, ShieldCheck, Sparkles, Truck } from "lucide-react";

/**
 * Product highlights. Merchandising can set them per product with Shopify tags
 * in the form `highlight:Your highlight` — otherwise the MIRAVIKA service
 * standards that apply to every order are shown.
 */
export function highlightsForProduct(tags: string[] | undefined): string[] {
  const fromTags = (tags ?? [])
    .filter((t) => t.toLowerCase().startsWith("highlight:"))
    .map((t) => t.slice(10).trim())
    .filter(Boolean);
  if (fromTags.length) return fromTags.slice(0, 6);
  return [
    "Curated and quality-checked by the MIRAVIKA studio",
    "Arrives in signature MIRAVIKA packaging — gift ready",
    "Dispatched within 24–48 hours with tracking",
    "7-day easy returns · Cash on Delivery across India",
  ];
}

const ICONS = [Gem, Package, Truck, ShieldCheck, Sparkles, CalendarCheck];

export function ProductHighlights({ highlights }: { highlights: string[] }) {
  if (!highlights.length) return null;
  return (
    <div className="mt-6">
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Highlights</p>
      <ul className="mt-3 space-y-2.5">
        {highlights.map((h, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li key={h} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" strokeWidth={1.6} />
              <span>{h}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Estimated delivery window, computed from today — India and international. */
export function EstimatedDelivery() {
  const fmt = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };
  return (
    <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-border/60 bg-beige/30 p-4">
      <CalendarCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" strokeWidth={1.6} />
      <div className="text-sm">
        <p className="font-medium">
          Estimated delivery {fmt(4)} – {fmt(9)}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          India 3–7 business days · International 7–14 business days. Order today and we dispatch within 24–48 hours.
        </p>
      </div>
    </div>
  );
}

/** The brand story block — MIRAVIKA's own positioning, no product-specific claims. */
export function LuxuryProductStory({ title }: { title: string }) {
  return (
    <section className="mt-20 overflow-hidden rounded-lg border border-border/60 bg-beige/30">
      <div className="p-7 md:p-12">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">The MIRAVIKA Standard</p>
        <h2 className="mt-3 max-w-2xl font-display text-2xl leading-snug md:text-3xl">
          Why {title} belongs in your edit
        </h2>
        <div className="mt-5 grid gap-6 text-sm leading-relaxed text-muted-foreground md:grid-cols-3">
          <p>
            <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-foreground">Curation</span>
            Every piece in the boutique is selected by our studio team for material quality, finish and how it wears in
            real life — not for how quickly it can be shipped.
          </p>
          <p>
            <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-foreground">Presentation</span>
            Orders arrive in MIRAVIKA's signature packaging, sealed and gift-ready, so the piece feels considered from the
            moment it reaches your door.
          </p>
          <p>
            <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-foreground">Aftercare</span>
            Real people on support@miravika.com, 7-day easy returns and honest guidance on fit, care and styling — before
            and after you buy.
          </p>
        </div>
      </div>
    </section>
  );
}
