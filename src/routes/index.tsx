import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIRAVIKA — Handcrafted Hair Accessories" },
      { name: "description", content: "Luxury hair scrunchies, bows, clips & bands. Designed in India. Free shipping ₹999+. COD available." },
    ],
  }),
  component: Home,
});

const COLLECTIONS = [
  { slug: "scrunchies", title: "Scrunchies", tag: "Everyday silk" },
  { slug: "bows", title: "Bows", tag: "Romantic edits" },
  { slug: "clips", title: "Clips", tag: "Sculpted shine" },
  { slug: "bands", title: "Hair Bands", tag: "Quiet drama" },
] as const;

function Home() {
  const { data: products = [], isLoading } = useProducts(undefined, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:gap-16 md:pb-24 md:pt-16">
          <div className="order-2 md:order-1">
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">New · Spring Edit</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">
              Heirloom hair, <em className="text-gold not-italic">made modern.</em>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              Handcrafted in small batches with luxe fabrics, brass detailing and a forever-finish. MIRAVIKA is hair jewellery for the everyday muse.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-[0.18em] text-ivory hover:bg-foreground/90">
                Shop the Edit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/about" className="text-xs uppercase tracking-[0.18em] underline-offset-4 hover:underline">
                Our story
              </Link>
            </div>
          </div>
          <div className="relative order-1 md:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-beige">
              <img
                alt="MIRAVIKA hair accessory campaign"
                src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 rounded-full bg-ivory/90 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] backdrop-blur">
                Made in India
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden h-32 w-32 rounded-full border border-gold/40 md:block" />
            <div className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-full bg-gold/20 md:block" />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/60 bg-beige/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 text-center md:grid-cols-4">
          {[
            { icon: Truck, label: "Free Shipping ₹999+" },
            { icon: ShieldCheck, label: "Secure Payments" },
            { icon: Sparkles, label: "Handcrafted in India" },
            { icon: Award, label: "Loved by 10,000+ women" },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-1.5 md:flex-row md:justify-center md:gap-2">
              <t.icon className="h-4 w-4 text-gold" />
              <span className="text-[11px] uppercase tracking-[0.16em] text-foreground/80">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Collections</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Shop by category</h2>
          </div>
          <Link to="/shop" className="hidden text-xs uppercase tracking-[0.18em] hover:text-gold md:inline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {COLLECTIONS.map((c, i) => (
            <Link
              key={c.slug}
              to="/collection/$slug"
              params={{ slug: c.slug }}
              className="group relative aspect-[3/4] overflow-hidden rounded-md bg-beige"
            >
              <img
                src={`https://images.unsplash.com/photo-${["1611652022419-a9419f74343d","1522335789203-aaa4e1ae2cb6","1583292650898-7d22cd27ca6f","1571513722275-4b41940f54b8"][i]}?w=600&q=80`}
                alt={c.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-ivory md:p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] opacity-80">{c.tag}</p>
                <h3 className="font-display text-lg md:text-xl">{c.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Bestsellers</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">The everyday icons</h2>
          </div>
          <Link to="/shop" className="text-xs uppercase tracking-[0.18em] hover:text-gold">View all →</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-md bg-beige" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/70 bg-beige/30 p-10 text-center">
            <h3 className="font-display text-xl">No products yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell the chat what product to create (name and price) and we'll publish it to your store instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Editorial */}
      <section className="bg-beige/40">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="relative aspect-square overflow-hidden rounded-md">
            <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=80" alt="MIRAVIKA atelier" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold">The Atelier</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Small batch. Big love.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Every piece is hand-finished by a tiny team of women artisans in Jaipur. We use mulberry silk, French satin and recycled brass — never plastic.
            </p>
            <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] hover:text-gold">
              Read our story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
