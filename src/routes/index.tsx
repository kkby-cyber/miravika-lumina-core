import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Globe, Handshake, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";
import logoAsset from "@/assets/miravika-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIRAVIKA — Luxury Redefined | Premium Fashion, Beauty & Lifestyle" },
      { name: "description", content: "Discover MIRAVIKA — premium fashion, beauty, hair and lifestyle accessories inspired by global trends. Worldwide shipping. Everyday luxury." },
      { property: "og:title", content: "MIRAVIKA — Luxury Redefined" },
      { property: "og:description", content: "Premium fashion, beauty and lifestyle accessories inspired by global trends." },
    ],
  }),
  component: Home,
});

const COLLECTIONS = [
  { slug: "magnetic-earrings", title: "Magnetic Earrings", tag: "Pierce-free brilliance", img: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80" },
  { slug: "fashion-accessories", title: "Fashion", tag: "Everyday statement", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80" },
  { slug: "beauty-accessories", title: "Beauty", tag: "Ritual essentials", img: "https://images.unsplash.com/photo-1522335789203-aaa4e1ae2cb6?w=800&q=80" },
  { slug: "hair-accessories", title: "Hair", tag: "Heirloom finishes", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80" },
  { slug: "home-decor", title: "Home Decor", tag: "Curated living", img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80" },
  { slug: "trending", title: "Trending", tag: "This week's edit", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80" },
] as const;

const WHY = [
  { icon: Award, title: "Premium Quality", desc: "Handpicked pieces, quality-checked in-house." },
  { icon: Globe, title: "Worldwide Shipping", desc: "Delivered to India, US, UK, EU, Australia & more." },
  { icon: ShieldCheck, title: "Secure Payments", desc: "SSL-protected checkout in your currency." },
  { icon: Sparkles, title: "Handpicked Products", desc: "Curated by our style team from global trends." },
  { icon: Heart, title: "Customer Satisfaction", desc: "10,000+ women trust the Miravika experience." },
  { icon: Handshake, title: "Easy Returns", desc: "7-day hassle-free returns, worldwide." },
];

function Home() {
  const { data: products = [], isLoading } = useProducts(undefined, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-noir text-ivory">
        <div className="absolute inset-0 opacity-20">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=80"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/80 to-noir/40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-16 md:grid-cols-2 md:gap-16 md:pb-28 md:pt-24">
          <div>
            <img src={logoAsset.url} alt="MIRAVIKA" className="h-24 w-auto md:h-28" />
            <p className="mt-8 text-[11px] uppercase tracking-[0.32em] text-gold">Everyday Luxury · Est. 2026</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.02] md:text-7xl">
              Luxury <span className="gold-gradient-text italic">Redefined.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/75 md:text-base">
              Style that speaks before you do. Discover premium fashion, beauty and lifestyle accessories inspired by global trends — designed for the modern woman, worldwide.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-noir transition hover:bg-gold/90">
                Shop Collection <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full border border-ivory/30 px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-ivory hover:border-gold hover:text-gold">
                Explore Best Sellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border/60 bg-beige">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 text-center md:grid-cols-4">
          {[
            { icon: Truck, label: "Worldwide Shipping" },
            { icon: ShieldCheck, label: "Secure Payments" },
            { icon: Sparkles, label: "Premium Quality" },
            { icon: Award, label: "Loved Worldwide" },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-1.5 md:flex-row md:justify-center md:gap-2">
              <t.icon className="h-4 w-4 text-gold" />
              <span className="text-[11px] uppercase tracking-[0.18em] text-foreground/80">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Featured Collections</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Shop the Universe</h2>
          <div className="mx-auto mt-4 h-px w-24 gold-line" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to="/collection/$slug"
              params={{ slug: c.slug }}
              className="group relative aspect-[3/4] overflow-hidden rounded-md bg-beige"
            >
              <img src={c.img} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-ivory md:p-6">
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold">{c.tag}</p>
                <h3 className="mt-1 font-display text-xl md:text-2xl">{c.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why MIRAVIKA */}
      <section className="bg-beige">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="mb-12 text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">The Miravika Promise</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Why Miravika</h2>
            <div className="mx-auto mt-4 h-px w-24 gold-line" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {WHY.map((w) => (
              <div key={w.title} className="rounded-md border border-border/60 bg-ivory p-6 text-center transition hover:border-gold">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-gold/10">
                  <w.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mt-4 font-display text-lg">{w.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Best Sellers</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Loved by our community</h2>
          </div>
          <Link to="/shop" className="text-xs uppercase tracking-[0.2em] hover:text-gold">View all →</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-md bg-beige" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/70 bg-beige/50 p-12 text-center">
            <h3 className="font-display text-xl">Curating your first collection</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Products will appear here shortly. Tell the chat what to add — e.g. "Create a Magnetic Rose Earring set at ₹799".
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

      {/* Customer reviews (empty state honest) */}
      <section className="bg-beige">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="mb-12 text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Loved Worldwide</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Real Women. Real Style.</h2>
            <div className="mx-auto mt-4 h-px w-24 gold-line" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-md border border-border/60 bg-ivory p-6">
                <div className="flex items-center gap-1 text-gold">{"★★★★★".split("").map((s, k) => <span key={k}>{s}</span>)}</div>
                <p className="mt-4 text-sm italic text-muted-foreground">
                  "No reviews yet — be the first to share your Miravika moment. Tag <span className="text-gold">@miravika</span> on Instagram to be featured."
                </p>
                <div className="mt-4 border-t border-border/40 pt-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Awaiting your story</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video / Instagram showcase */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold">@miravika</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Follow the Journey</h2>
          <div className="mx-auto mt-4 h-px w-24 gold-line" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {[
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
            "https://images.unsplash.com/photo-1522335789203-aaa4e1ae2cb6?w=600&q=80",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
            "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80",
          ].map((src) => (
            <a key={src} href="https://instagram.com" target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-md bg-beige">
              <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center bg-noir/40 opacity-0 transition group-hover:opacity-100">
                <span className="text-xs uppercase tracking-[0.2em] text-ivory">View Reel</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-noir text-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="relative aspect-square overflow-hidden rounded-md">
            <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1000&q=80" alt="MIRAVIKA atelier" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Our Story</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">A brand built on <em className="not-italic gold-gradient-text">elegance.</em></h2>
            <p className="mt-6 text-sm leading-relaxed text-ivory/75 md:text-base">
              Miravika began with a simple idea — that luxury should feel personal, not distant. We travel the world's trend capitals to bring you carefully curated pieces in fashion, beauty and lifestyle, made for every moment of your day.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/60">
              From Paris ateliers to New York studios, every product is quality-checked and delivered with love — worldwide.
            </p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold px-6 py-3 text-xs uppercase tracking-[0.22em] text-gold hover:bg-gold hover:text-noir">
              Read our story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
