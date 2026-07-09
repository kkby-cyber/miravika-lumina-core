import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Globe, Handshake, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";
import heroChampagne from "@/assets/IMG-20260709-WA0018.jpg.asset.json";
import heroBoutique from "@/assets/IMG-20260709-WA0013.jpg.asset.json";
import heroBlackGold from "@/assets/IMG-20260709-WA0017.jpg.asset.json";
import jewelry from "@/assets/IMG-20260709-WA0008.jpg.asset.json";
import streetScarf from "@/assets/IMG-20260709-WA0014.jpg.asset.json";
import streetBeige from "@/assets/IMG-20260709-WA0010.jpg.asset.json";
import cream from "@/assets/IMG-20260709-WA0012.jpg.asset.json";
import corridor from "@/assets/IMG-20260709-WA0015.jpg.asset.json";
import emerald from "@/assets/IMG-20260709-WA0009.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIRAVIKA — Luxury Redefined | Premium Fashion, Beauty & Lifestyle" },
      { name: "description", content: "Discover MIRAVIKA — premium fashion, jewellery, beauty and lifestyle accessories. Curated global trends. Worldwide shipping." },
      { property: "og:title", content: "MIRAVIKA — Luxury Redefined" },
      { property: "og:description", content: "Premium fashion, jewellery, beauty and lifestyle accessories inspired by global trends." },
      { property: "og:image", content: heroChampagne.url },
      { name: "twitter:image", content: heroChampagne.url },
    ],
  }),
  component: Home,
});

const CATEGORIES = [
  { slug: "fashion-accessories", title: "Women", tag: "Ready to Wear", img: heroBoutique.url },
  { slug: "bags", title: "Bags", tag: "Everyday Icons", img: streetBeige.url },
  { slug: "magnetic-earrings", title: "Jewellery", tag: "Fine · Fashion", img: jewelry.url },
  { slug: "beauty-accessories", title: "Beauty", tag: "Ritual Essentials", img: cream.url },
  { slug: "hair-accessories", title: "Accessories", tag: "Silk · Satin · Gold", img: streetScarf.url },
  { slug: "luxury", title: "Luxury Collection", tag: "The Miravika Edit", img: heroBlackGold.url },
] as const;

const WHY = [
  { icon: Award, title: "Premium Quality" },
  { icon: Globe, title: "Worldwide Shipping" },
  { icon: ShieldCheck, title: "Secure Payments" },
  { icon: Sparkles, title: "Handpicked Edit" },
  { icon: Heart, title: "Customer First" },
  { icon: Handshake, title: "Easy Returns" },
];

function Home() {
  const { data: products = [], isLoading } = useProducts(undefined, 12);

  return (
    <div>
      {/* HERO — editorial full-bleed */}
      <section className="relative h-[92vh] min-h-[620px] w-full overflow-hidden bg-beige">
        <img
          src={heroChampagne.url}
          alt="MIRAVIKA campaign — champagne satin gown in a palace hall"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-center"
          fetchPriority="high"
        />
        {/* Left-side wash for legibility on mobile */}
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/90 via-ivory/40 to-transparent md:from-ivory/70 md:via-ivory/10" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 md:px-10">
          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-foreground/70 md:text-[11px]">
              The Autumn Edit · 2026
            </p>
            <h1 className="mt-5 font-display text-[42px] leading-[1.02] text-foreground md:text-7xl">
              Luxury,
              <br />
              <span className="italic gold-gradient-text">Redefined.</span>
            </h1>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-foreground/70 md:text-base">
              A curation of fashion, jewellery and lifestyle — designed for the modern woman. Effortless. Elegant. Everyday.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-noir px-8 py-3.5 text-[11px] uppercase tracking-[0.24em] text-ivory transition hover:bg-foreground/85"
              >
                Shop Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/collection/$slug"
                params={{ slug: "luxury" }}
                className="inline-flex items-center gap-2 border-b border-foreground/40 pb-1 text-[11px] uppercase tracking-[0.24em] text-foreground hover:border-gold hover:text-gold"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
        {/* Marquee */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-foreground/10 bg-ivory/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-foreground/70">
            <span>Free Worldwide Shipping ₹2999+ / $49+</span>
            <span className="hidden md:inline">Cash on Delivery · India</span>
            <span className="hidden md:inline">Handpicked Global Edit</span>
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-10 flex items-end justify-between md:mb-14">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Shop by Category</p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">The Universe of Miravika</h2>
          </div>
          <Link to="/shop" className="hidden text-[11px] uppercase tracking-[0.22em] hover:text-gold md:inline-block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/collection/$slug"
              params={{ slug: c.slug }}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-beige"
            >
              <img
                src={c.img}
                alt={c.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-ivory md:p-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold">{c.tag}</p>
                <h3 className="mt-1 font-display text-xl md:text-2xl">{c.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL SPLIT — Luxury Collection */}
      <section className="bg-noir text-ivory">
        <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2">
          <div className="relative aspect-[4/5] md:aspect-auto">
            <img src={heroBlackGold.url} alt="Luxury collection — black satin with gold embroidery" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 md:px-14 md:py-24">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Luxury Collection</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">
              Made for the moment you <span className="italic gold-gradient-text">arrive.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/70 md:text-base">
              Considered silhouettes, hand-finished detailing and the quiet confidence of pieces built to be remembered.
            </p>
            <Link
              to="/collection/$slug"
              params={{ slug: "luxury" }}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-gold px-8 py-3.5 text-[11px] uppercase tracking-[0.24em] text-gold transition hover:bg-gold hover:text-noir"
            >
              Discover the Edit <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS / BESTSELLERS */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold">New Arrivals</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl">Freshly Curated</h2>
          <div className="mx-auto mt-4 h-px w-16 gold-line" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-beige" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-beige/50 p-16 text-center">
            <h3 className="font-display text-2xl">Your collection begins here</h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              No products yet. Tell the chat what to add — e.g. "Create a Satin Slip Dress in Champagne at ₹2499".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-8 py-3.5 text-[11px] uppercase tracking-[0.24em] hover:border-gold hover:text-gold"
          >
            View All Products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* JEWELLERY SPOTLIGHT */}
      <section className="bg-beige">
        <div className="mx-auto grid max-w-7xl items-center gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 md:order-1 md:px-14 md:py-24">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Jewellery</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">
              Little things that <span className="italic gold-gradient-text">shine.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              Magnetic earrings, delicate chains and heirloom-inspired pieces to wear every day.
            </p>
            <Link
              to="/collection/$slug"
              params={{ slug: "magnetic-earrings" }}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-noir px-8 py-3.5 text-[11px] uppercase tracking-[0.24em] text-ivory hover:bg-foreground/85"
            >
              Shop Jewellery <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="relative aspect-[4/5] md:order-2 md:aspect-auto">
            <img src={jewelry.url} alt="Miravika jewellery — layered gold chains" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      {/* THE PROMISE */}
      <section className="border-y border-border/50 bg-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-14 md:grid-cols-6 md:gap-8">
          {WHY.map((w) => (
            <div key={w.title} className="flex flex-col items-center gap-3 text-center">
              <w.icon className="h-6 w-6 text-gold" strokeWidth={1.2} />
              <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/80">{w.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STREET STYLE / GIFT COLLECTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold">The Gift Edit</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl">Considered Gifting</h2>
          <div className="mx-auto mt-4 h-px w-16 gold-line" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {[
            { img: streetScarf.url, title: "For the Traveller", tag: "Scarves · Silk" },
            { img: emerald.url, title: "For the Occasion", tag: "Evening Edit" },
            { img: corridor.url, title: "For the Everyday", tag: "Ready to Wear" },
          ].map((g) => (
            <Link
              key={g.title}
              to="/shop"
              className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-beige"
            >
              <img src={g.img} alt={g.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{g.tag}</p>
                <h3 className="mt-1 font-display text-2xl">{g.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-beige">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Loved Worldwide</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl">Real Women. Real Style.</h2>
          <div className="mx-auto mt-4 h-px w-16 gold-line" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <figure key={i} className="rounded-lg border border-border/50 bg-ivory p-8 text-left">
                <div className="text-gold">★★★★★</div>
                <blockquote className="mt-4 text-sm italic leading-relaxed text-muted-foreground">
                  "No reviews yet — be the first to share your Miravika moment."
                </blockquote>
                <figcaption className="mt-6 border-t border-border/40 pt-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Awaiting your story
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold">@miravika</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl">Follow the Journey</h2>
          <div className="mx-auto mt-4 h-px w-16 gold-line" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {[streetBeige.url, jewelry.url, emerald.url, corridor.url, cream.url, heroBoutique.url, streetScarf.url, heroBlackGold.url].map((src, i) => (
            <a
              key={src + i}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className={`group relative overflow-hidden rounded-md bg-beige ${i > 3 ? "hidden md:block" : ""} aspect-square`}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center bg-noir/40 opacity-0 transition group-hover:opacity-100">
                <span className="text-[10px] uppercase tracking-[0.28em] text-ivory">View Post</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="bg-noir text-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <img src={cream.url} alt="MIRAVIKA — modern woman" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Our Story</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">
              A brand built on <span className="italic gold-gradient-text">elegance.</span>
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-ivory/75 md:text-base">
              Miravika began with a simple idea — that luxury should feel personal, not distant. We travel the world's trend capitals to bring you carefully curated pieces in fashion, jewellery, beauty and lifestyle.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/55">
              From Paris ateliers to New York studios — quality-checked, and delivered with love, worldwide.
            </p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold px-8 py-3.5 text-[11px] uppercase tracking-[0.24em] text-gold hover:bg-gold hover:text-noir">
              Read Our Story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-24">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold">The Miravika List</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl">Be first to the edit.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Private previews, launch invitations and 10% off your first order.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="flex-1 rounded-full border border-border bg-ivory px-5 py-3.5 text-sm outline-none focus:border-gold"
            />
            <button className="rounded-full bg-noir px-8 py-3.5 text-[11px] uppercase tracking-[0.24em] text-ivory hover:bg-foreground/85">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
