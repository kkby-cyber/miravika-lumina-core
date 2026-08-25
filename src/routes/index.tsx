import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Globe, Handshake, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useCollection } from "@/hooks/useProducts";
import { resolveCollectionHandle } from "@/lib/shopify";
import { ProductCarousel } from "@/components/site/ProductCarousel";
import { VideoSection } from "@/components/site/VideoSection";
import { Reveal } from "@/components/site/Reveal";
import { Newsletter } from "@/components/site/Newsletter";
import heroChampagne from "@/assets/IMG-20260709-WA0018.jpg.asset.json";
import heroBoutique from "@/assets/IMG-20260709-WA0013.jpg.asset.json";
import heroBlackGold from "@/assets/IMG-20260709-WA0017.jpg.asset.json";
import jewelry from "@/assets/IMG-20260709-WA0008.jpg.asset.json";
import streetScarf from "@/assets/IMG-20260709-WA0014.jpg.asset.json";
import streetBeige from "@/assets/IMG-20260709-WA0010.jpg.asset.json";
import cream from "@/assets/IMG-20260709-WA0012.jpg.asset.json";
import corridor from "@/assets/IMG-20260709-WA0015.jpg.asset.json";
import emerald from "@/assets/IMG-20260709-WA0009.jpg.asset.json";
import catFashion from "@/assets/cat-fashion.jpg.asset.json";
import catJewelry from "@/assets/cat-jewelry.jpg.asset.json";
import catBeauty from "@/assets/cat-beauty.jpg.asset.json";
import catGifts from "@/assets/cat-gifts.jpg.asset.json";
import { CustomerGallery, Testimonials } from "@/components/site/Testimonials";

const SITE = "https://miravika.com";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIRAVIKA — Luxury Redefined | Fashion, Jewelry, Beauty & Home" },
      {
        name: "description",
        content:
          "MIRAVIKA is an international lifestyle house of fashion, jewelry, beauty and home essentials. Curated global edits, worldwide shipping and a secure encrypted checkout.",
      },
      { property: "og:title", content: "MIRAVIKA — Luxury Redefined" },
      {
        property: "og:description",
        content: "Premium fashion, jewelry, beauty and lifestyle — curated for the modern global woman.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "MIRAVIKA" },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:image", content: heroChampagne.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MIRAVIKA — Luxury Redefined" },
      { name: "twitter:image", content: heroChampagne.url },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/` },
      { rel: "preload", as: "image", href: heroChampagne.url, fetchPriority: "high" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE}/#organization`,
              name: "MIRAVIKA",
              url: `${SITE}/`,
              logo: `${SITE}/favicon.ico`,
              email: "support@miravika.com",
              sameAs: [
                "https://instagram.com/miravika.india",
                "https://facebook.com/miravika",
                "https://pinterest.com/miravika",
              ],
            },
            {
              "@type": "WebSite",
              "@id": `${SITE}/#website`,
              name: "MIRAVIKA",
              url: `${SITE}/`,
              publisher: { "@id": `${SITE}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

const CATEGORIES = [
  { slug: "signature-collection", title: "Signature Collection", tag: "The Iconic Edit", img: heroBlackGold.url },
  { slug: "new-arrivals", title: "New Arrivals", tag: "Just Landed", img: streetScarf.url },
  { slug: "ready-to-wear", title: "Ready-to-Wear", tag: "Considered Silhouettes", img: catFashion.url },
  { slug: "accessories-fine-goods", title: "Accessories Fine Goods", tag: "Finishing Pieces", img: catJewelry.url },
  { slug: "curated-sets", title: "Curated Sets", tag: "For Every Occasion", img: catGifts.url },
] as const;

const WHY = [
  { icon: Award, title: "Premium Quality" },
  { icon: Globe, title: "Worldwide Shipping" },
  { icon: ShieldCheck, title: "Secure Payments" },
  { icon: Sparkles, title: "Handpicked Edit" },
  { icon: Heart, title: "Customer First" },
  { icon: Handshake, title: "Easy Returns" },
];

function CollectionCarousel({
  eyebrow,
  title,
  sub,
  slug,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  slug: string;
}) {
  const { data, isLoading } = useCollection(resolveCollectionHandle(slug), 16);
  return (
    <ProductCarousel
      eyebrow={eyebrow}
      title={title}
      subtitle={sub}
      slug={slug}
      products={data?.products ?? []}
      isLoading={isLoading}
    />
  );
}

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-beige">
        <img
          src={heroChampagne.url}
          alt="MIRAVIKA autumn campaign — champagne satin styling in a palace hall"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] md:object-center"
          fetchPriority="high"
          decoding="async"
        />
        {/* Luxury overlay — soft ivory wash for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/95 via-ivory/55 to-transparent md:from-ivory/80 md:via-ivory/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory/40 via-transparent to-transparent" />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-7 pb-16 md:px-16 lg:px-20">
          <div className="max-w-xl">
            <p className="animate-lux-fade-up text-[10px] uppercase tracking-[0.42em] text-foreground/65 md:text-[11px]">
              The New Season · Autumn 2026
            </p>
            <h1 className="animate-lux-fade-up mt-6 font-display text-[46px] leading-[0.98] tracking-[-0.01em] text-foreground md:mt-7 md:text-[84px]" style={{ animationDelay: "140ms" }}>
              Luxury,
              <br />
              <span className="italic gold-gradient-text">Redefined.</span>
            </h1>
            <div className="animate-lux-fade-up mt-7 h-px w-20 gold-line" style={{ animationDelay: "260ms" }} />
            <p className="animate-lux-fade-up mt-6 max-w-md text-[14px] leading-[1.8] text-foreground/70 md:text-[16px]" style={{ animationDelay: "340ms" }}>
              An international house of fashion, jewelry, beauty and home. Curated for the modern woman — effortless,
              elegant, everyday.
            </p>
            <div className="animate-lux-fade-up mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ animationDelay: "460ms" }}>
              <Link
                to="/collection/$slug"
                params={{ slug: "new-arrivals" }}
                className="group inline-flex min-h-[54px] items-center gap-3 rounded-full bg-noir px-10 text-[11px] uppercase tracking-[0.26em] text-ivory shadow-[0_18px_40px_-24px_rgba(17,17,17,0.9)] transition-all duration-500 hover:bg-foreground/88 hover:shadow-[0_22px_50px_-20px_rgba(17,17,17,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                Shop New Arrivals
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/collection/$slug"
                params={{ slug: "signature-collection" }}
                className="inline-flex min-h-[44px] items-center border-b border-foreground/35 pb-1 text-[11px] uppercase tracking-[0.26em] text-foreground transition-colors hover:border-gold hover:text-gold"
              >
                Signature Collection
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-foreground/10 bg-ivory/75 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3.5 text-[9.5px] uppercase tracking-[0.28em] text-foreground/65 md:text-[10px]">
            <span>Free Worldwide Shipping ₹2999+</span>
            <span className="hidden md:inline">Secure Encrypted Checkout</span>
            <span className="hidden md:inline">Handpicked Global Edit</span>
          </div>
        </div>
      </section>

      {/* FILM — SIGNATURE */}
      <VideoSection
        src="/video/miravika-signature.mp4"
        poster="/video/miravika-signature-poster.jpg"
        eyebrow="The Film"
        title={<>The Miravika <span className="italic gold-gradient-text">signature.</span></>}
        copy="A closer look at the craft, the finish and the detail behind every piece we curate."
        ctaLabel="Shop New Arrivals"
        ctaSlug="new-arrivals"
      />

      {/* CATEGORIES */}
      <section aria-labelledby="categories-heading" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-32">
        <Reveal className="mb-10 flex items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-gold">Shop by Category</p>
            <h2 id="categories-heading" className="mt-3 font-display text-[28px] leading-tight md:text-5xl">
              The Universe of Miravika
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden shrink-0 border-b border-foreground/25 pb-1 text-[11px] uppercase tracking-[0.22em] transition-colors hover:border-gold hover:text-gold md:inline-block"
          >
            View all
          </Link>
        </Reveal>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-7">
          {CATEGORIES.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={Math.min(i, 3) * 80} className={i === 0 ? "col-span-2 md:row-span-2" : ""}>
              <Link
                to="/collection/$slug"
                params={{ slug: c.slug }}
                className={`group relative block overflow-hidden rounded-2xl bg-beige shadow-[0_16px_40px_-30px_rgba(17,17,17,0.6)] transition-shadow duration-700 hover:shadow-[0_30px_60px_-30px_rgba(17,17,17,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
                  i === 0 ? "aspect-[16/10] md:aspect-auto md:h-full" : "aspect-[3/4]"
                }`}
              >
                <img
                  src={c.img}
                  alt={`${c.title} — MIRAVIKA edit`}
                  loading="lazy"
                  decoding="async"
                  width={900}
                  height={1200}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/30 to-transparent transition-opacity duration-700 group-hover:from-noir/90" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-ivory md:p-7">
                  <p className="text-[9px] uppercase leading-[1.6] tracking-[0.3em] text-gold">{c.tag}</p>
                  <h3 className="mt-2 font-display text-lg leading-[1.2] md:text-2xl">{c.title}</h3>
                  <span className="mt-2 block h-px w-0 bg-gold transition-all duration-700 group-hover:w-12" />
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* FILM — GIFTING */}
      <VideoSection
        src="/video/miravika-rakhi.mp4"
        poster="/video/miravika-rakhi-poster.jpg"
        eyebrow="Gifting Edit"
        title={<>Gifts wrapped in <span className="italic gold-gradient-text">gold.</span></>}
        copy="Festive-ready keepsakes, presented in signature Miravika packaging — made to be remembered."
        ctaLabel="Shop Curated Sets"
        ctaSlug="curated-sets"
        align="right"
      />

      {/* SIGNATURE COLLECTION */}
      <div className="bg-beige/40">
      <CollectionCarousel eyebrow="Signature Collection" title="Most Loved" sub="The definitive Miravika edit — pieces our community returns to, season after season." slug="signature-collection" />
      </div>

      {/* EDITORIAL SPLIT */}
      <section className="bg-noir text-ivory">
        <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2">
          <div className="relative aspect-[4/5] md:aspect-auto">
            <img
              src={heroBlackGold.url}
              alt="Black satin with gold embroidery — MIRAVIKA luxury edit"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 md:px-16 md:py-28">
            <Reveal>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold">The Luxury Edit</p>
              <h2 className="mt-5 font-display text-[34px] leading-[1.05] md:text-6xl">
                Made for the moment you <span className="italic gold-gradient-text">arrive.</span>
              </h2>
              <p className="mt-6 max-w-md text-[14px] leading-[1.85] text-ivory/70 md:text-base">
                Considered silhouettes, hand-finished detailing and the quiet confidence of pieces built to be
                remembered.
              </p>
              <Link
                to="/collection/$slug"
                params={{ slug: "signature-collection" }}
                className="group mt-10 inline-flex min-h-[52px] w-fit items-center gap-3 rounded-full border border-gold px-10 text-[11px] uppercase tracking-[0.26em] text-gold transition-all duration-500 hover:bg-gold hover:text-noir"
              >
                Discover the Edit
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <CollectionCarousel eyebrow="Just Landed" title="New Arrivals" sub="The newest additions to the boutique." slug="new-arrivals" />

      {/* JEWELRY SPOTLIGHT */}
      <section className="bg-beige">
        <div className="mx-auto grid max-w-7xl items-center gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 md:order-1 md:px-16 md:py-28">
            <Reveal>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Fine Goods</p>
              <h2 className="mt-5 font-display text-[34px] leading-[1.05] md:text-6xl">
                Little things that <span className="italic gold-gradient-text">shine.</span>
              </h2>
              <p className="mt-6 max-w-md text-[14px] leading-[1.85] text-muted-foreground md:text-base">
                Sterling silver, moissanite and heirloom-inspired pieces — wear them daily, keep them forever.
              </p>
              <Link
                to="/collection/$slug"
                params={{ slug: "accessories-fine-goods" }}
                className="group mt-10 inline-flex min-h-[52px] w-fit items-center gap-3 rounded-full bg-noir px-10 text-[11px] uppercase tracking-[0.26em] text-ivory transition-colors duration-500 hover:bg-foreground/85"
              >
                Shop Fine Goods
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
          <div className="relative aspect-[4/5] md:order-2 md:aspect-auto">
            <img
              src={jewelry.url}
              alt="MIRAVIKA jewelry — layered gold chains"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* READY-TO-WEAR */}
      <div className="bg-beige/40">
      <CollectionCarousel eyebrow="Ready-to-Wear" title="Considered Silhouettes" sub="Elevated pieces for every day and every occasion." slug="ready-to-wear" />
      </div>

      {/* ACCESSORIES FINE GOODS */}
      <CollectionCarousel eyebrow="Accessories Fine Goods" title="Little Things That Shine" sub="Sterling silver, moissanite and heirloom-inspired pieces." slug="accessories-fine-goods" />

      {/* PROMISE */}
      <section aria-label="Our promise" className="border-y border-border/50 bg-ivory">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-6">
          {WHY.map((w) => (
            <li key={w.title} className="flex flex-col items-center gap-3 text-center">
              <w.icon className="h-6 w-6 text-gold" strokeWidth={1.2} aria-hidden="true" />
              <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/80">{w.title}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CUSTOMER TESTIMONIALS (genuine published reviews only) */}
      <Testimonials />

      {/* CUSTOMER PHOTOS (from real photo reviews only) */}
      <CustomerGallery />

      {/* SHOP BY OCCASION */}
      <section aria-labelledby="occasion-heading" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-28">
        <Reveal className="mb-10 text-center md:mb-14">
          <p className="text-[10px] uppercase tracking-[0.34em] text-gold">Shop by Occasion</p>
          <h2 id="occasion-heading" className="mt-3 font-display text-[28px] leading-tight md:text-5xl">
            Considered Gifting
          </h2>
          <div className="mx-auto mt-5 h-px w-16 gold-line" />
        </Reveal>
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-7">
          {[
            { img: streetScarf.url, title: "For the Traveller", tag: "Fashion", slug: "womens-fashion" },
            { img: emerald.url, title: "For the Occasion", tag: "Jewelry", slug: "jewelry-accessories" },
            { img: corridor.url, title: "For the Celebration", tag: "Gifts", slug: "gifts" },
          ].map((g, i) => (
            <Reveal as="li" key={g.title} delay={i * 90}>
              <Link
                to="/collection/$slug"
                params={{ slug: g.slug }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-beige shadow-[0_16px_40px_-30px_rgba(17,17,17,0.6)] transition-shadow duration-700 hover:shadow-[0_30px_60px_-30px_rgba(17,17,17,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                <img
                  src={g.img}
                  alt={`${g.title} — MIRAVIKA gift edit`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{g.tag}</p>
                  <h3 className="mt-1.5 font-display text-2xl">{g.title}</h3>
                  <span className="mt-2 block h-px w-0 bg-gold transition-all duration-700 group-hover:w-12" />
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* BRAND STORY */}
      <section aria-labelledby="story-heading" className="bg-noir text-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-20 md:px-8 md:py-32">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <img
              src={cream.url}
              alt="MIRAVIKA — the modern woman"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Our Story</p>
            <h2 id="story-heading" className="mt-5 font-display text-[34px] leading-[1.05] md:text-6xl">
              A house built on <span className="italic gold-gradient-text">elegance.</span>
            </h2>
            <p className="mt-7 text-[14px] leading-[1.9] text-ivory/75 md:text-base">
              Miravika began with a simple idea — that luxury should feel personal, never distant. We travel the
              world's trend capitals to bring you carefully curated pieces in fashion, jewelry, beauty and home.
            </p>
            <p className="mt-4 text-[14px] leading-[1.9] text-ivory/55">
              Quality-checked, thoughtfully packaged and delivered with care, worldwide.
            </p>
            <Link
              to="/about"
              className="group mt-10 inline-flex min-h-[52px] items-center gap-3 rounded-full border border-gold px-10 text-[11px] uppercase tracking-[0.26em] text-gold transition-all duration-500 hover:bg-gold hover:text-noir"
            >
              Read Our Story
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section aria-labelledby="instagram-heading" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-28">
        <Reveal className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.34em] text-gold">@miravika.india</p>
          <h2 id="instagram-heading" className="mt-3 font-display text-[28px] leading-tight md:text-5xl">
            Follow the Journey
          </h2>
          <div className="mx-auto mt-5 h-px w-16 gold-line" />
        </Reveal>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[streetBeige.url, catJewelry.url, emerald.url, streetScarf.url, catBeauty.url, heroBoutique.url, catGifts.url, heroBlackGold.url].map(
            (src, i) => (
              <li key={src + i} className={i > 3 ? "hidden md:block" : undefined}>
                <a
                  href="https://instagram.com/miravika.india"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View MIRAVIKA on Instagram"
                  className="group relative block aspect-square overflow-hidden rounded-xl bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <img
                    src={src}
                    alt="MIRAVIKA campaign moment"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-noir/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-ivory">View Post</span>
                  </div>
                </a>
              </li>
            ),
          )}
        </ul>
      </section>

      {/* NEWSLETTER */}
      <Newsletter />
    </div>
  );
}
