import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Gift,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useCollection } from "@/hooks/useProducts";
import { STORE_PROMISES } from "@/lib/store-policy";
import { resolveCollectionHandle } from "@/lib/collections";
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
      { title: "MIRAVIKA — Luxury Redefined | Hair Accessories, Earrings & Gifts" },
      {
        name: "description",
        content:
          "Discover MIRAVIKA — hair accessories, earrings, jewelry, rakhi and beauty essentials, beautifully finished and delivered across India with a secure checkout.",
      },
      { property: "og:title", content: "MIRAVIKA — Luxury Redefined" },
      {
        property: "og:description",
        content: "Hair accessories, earrings and keepsakes designed to finish every look.",
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
              logo: `${SITE}/miravika-logo-gold.png`,
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

/**
 * Category tiles. Each tile prefers genuine product photography (the collection's own
 * image, then its first product image) and falls back to the existing campaign asset.
 * A tile disappears once Nexus confirms the collection has no products.
 */
const CATEGORIES = [
  { slug: "best-sellers", title: "Best Sellers", tag: "Most Loved", img: heroBlackGold.url },
  { slug: "new-arrivals", title: "New Arrivals", tag: "Just Landed", img: streetScarf.url },
  {
    slug: "womens-fashion",
    title: "Hair Accessories",
    tag: "Claws · Clips · Bows",
    img: catFashion.url,
  },
  {
    slug: "jewelry-accessories",
    title: "Earrings & Jewelry",
    tag: "Everyday Shine",
    img: catJewelry.url,
  },
  { slug: "gifts", title: "Rakhi & Gifts", tag: "Made to Be Remembered", img: catGifts.url },
] as const;

const PROMISES = [
  { icon: BadgeCheck, title: "Quality Checked" },
  { icon: Truck, title: "Delivered Across India" },
  { icon: ShieldCheck, title: "Secure Razorpay Checkout" },
  { icon: RotateCcw, title: "Easy 7-Day Returns" },
  { icon: Gift, title: "Gift-Ready Packaging" },
  { icon: Sparkles, title: "Thoughtfully Designed" },
];

const OCCASIONS = [
  { img: streetScarf.url, title: "For Every Day", tag: "Hair Accessories", slug: "womens-fashion" },
  {
    img: emerald.url,
    title: "For the Occasion",
    tag: "Earrings & Jewelry",
    slug: "jewelry-accessories",
  },
  { img: corridor.url, title: "For the Celebration", tag: "Rakhi & Gifts", slug: "gifts" },
];

const INSTAGRAM = [
  streetBeige.url,
  catJewelry.url,
  emerald.url,
  streetScarf.url,
  catBeauty.url,
  heroBoutique.url,
  catGifts.url,
  heroBlackGold.url,
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

function CategoryTile({
  category,
  index,
}: {
  category: (typeof CATEGORIES)[number];
  index: number;
}) {
  // Same query key as the carousels, so this is usually served from cache.
  const { data, isSuccess } = useCollection(category.slug, 16);
  if (isSuccess && (!data || data.products.length === 0)) return null;
  const productImage = data?.image?.url ?? data?.products[0]?.images.edges[0]?.node.url;
  const src = productImage ?? category.img;
  const featured = index === 0;

  return (
    <Reveal
      as="li"
      delay={Math.min(index, 3) * 80}
      className={featured ? "col-span-2 md:row-span-2" : ""}
    >
      <Link
        to="/collection/$slug"
        params={{ slug: category.slug }}
        className={`group relative block overflow-hidden rounded-2xl bg-beige shadow-[0_16px_40px_-30px_rgba(31,30,28,0.6)] transition-shadow duration-700 hover:shadow-[0_30px_60px_-30px_rgba(31,30,28,0.45)] ${
          featured ? "aspect-[16/10] md:aspect-auto md:h-full" : "aspect-[3/4]"
        }`}
      >
        <img
          src={src}
          alt={`${category.title} — MIRAVIKA`}
          loading="lazy"
          decoding="async"
          width={900}
          height={1200}
          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/25 to-transparent transition-opacity duration-700 group-hover:from-noir/90" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-ivory md:p-7">
          <p className="text-[9px] uppercase leading-[1.6] tracking-[0.3em] text-gold">
            {category.tag}
          </p>
          <h3 className="mt-2 font-display text-xl leading-[1.15] md:text-3xl">{category.title}</h3>
          <span className="mt-3 block h-px w-8 origin-left bg-gold transition-transform duration-700 group-hover:scale-x-[1.8]" />
        </div>
      </Link>
    </Reveal>
  );
}

function EditorialCta({
  slug,
  children,
  tone = "dark",
}: {
  slug: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <Link
      to="/collection/$slug"
      params={{ slug }}
      className={`group mt-10 inline-flex min-h-[52px] w-fit items-center gap-3 rounded-full px-10 text-[11px] uppercase tracking-[0.26em] transition-colors duration-500 ${
        tone === "light"
          ? "border border-gold text-gold hover:bg-gold hover:text-noir"
          : "bg-charcoal text-ivory hover:bg-noir"
      }`}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
    </Link>
  );
}

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative h-[88svh] min-h-[580px] w-full overflow-hidden bg-beige">
        <img
          src={heroChampagne.url}
          alt="MIRAVIKA campaign — champagne satin styling in a palace hall"
          className="animate-lux-settle absolute inset-0 h-full w-full object-cover object-[72%_center] md:object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/95 via-ivory/55 to-transparent md:from-ivory/85 md:via-ivory/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory/45 via-transparent to-transparent" />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-7 pb-16 md:px-16 lg:px-20">
          <div className="max-w-xl">
            <p className="animate-lux-fade-up text-[10px] uppercase tracking-[0.42em] text-foreground/70 md:text-[11px]">
              MIRAVIKA · The New Edit
            </p>
            <h1
              className="animate-lux-fade-up mt-6 font-display text-[54px] font-normal leading-[0.95] tracking-[-0.015em] text-foreground md:mt-7 md:text-[104px]"
              style={{ animationDelay: "140ms" }}
            >
              Luxury,
              <br />
              <span className="italic gold-gradient-text">Redefined.</span>
            </h1>
            <div
              className="animate-lux-draw mt-7 h-px w-24 bg-gold"
              style={{ animationDelay: "420ms" }}
            />
            <p
              className="animate-lux-fade-up mt-6 max-w-md text-[14px] leading-[1.85] text-foreground/75 md:text-[16px]"
              style={{ animationDelay: "340ms" }}
            >
              Hair accessories, earrings and keepsakes designed to finish every look — thoughtfully
              made, beautifully presented.
            </p>
            <div
              className="animate-lux-fade-up mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
              style={{ animationDelay: "460ms" }}
            >
              <Link
                to="/collection/$slug"
                params={{ slug: "new-arrivals" }}
                className="group inline-flex min-h-[54px] items-center gap-3 rounded-full bg-charcoal px-10 text-[11px] uppercase tracking-[0.26em] text-ivory shadow-[0_18px_40px_-24px_rgba(31,30,28,0.9)] transition-[background-color,box-shadow] duration-500 hover:bg-noir hover:shadow-[0_22px_50px_-20px_rgba(31,30,28,0.65)]"
              >
                Shop New Arrivals
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/collection/$slug"
                params={{ slug: "best-sellers" }}
                className="inline-flex min-h-[44px] items-center border-b border-foreground/35 pb-1 text-[11px] uppercase tracking-[0.26em] text-foreground transition-colors hover:border-gold hover:text-gold"
              >
                Best Sellers
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-foreground/10 bg-ivory/80 backdrop-blur-md">
          <ul className="mx-auto flex max-w-7xl items-center justify-center gap-10 px-6 py-3.5 text-[9.5px] uppercase tracking-[0.26em] text-foreground/70 md:justify-between md:text-[10px]">
            <li>{STORE_PROMISES.shipping}</li>
            <li className="hidden md:block">{STORE_PROMISES.returns}</li>
            <li className="hidden lg:block">Secure checkout by Razorpay</li>
          </ul>
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        aria-labelledby="categories-heading"
        className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-32"
      >
        <Reveal className="mb-10 flex items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-gold">Shop by Category</p>
            <h2
              id="categories-heading"
              className="mt-3 font-display text-[34px] leading-tight md:text-6xl"
            >
              The World of Miravika
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
            <CategoryTile key={c.slug} category={c} index={i} />
          ))}
        </ul>
      </section>

      {/* FILM — SIGNATURE */}
      <VideoSection
        src="/video/miravika-signature.mp4"
        poster="/video/miravika-signature-poster.jpg"
        eyebrow="The Film"
        title={
          <>
            The Miravika <span className="italic gold-gradient-text">signature.</span>
          </>
        }
        copy="A closer look at the craft, the finish and the detail behind every piece."
        ctaLabel="Shop New Arrivals"
        ctaSlug="new-arrivals"
      />

      {/* NEW ARRIVALS */}
      <CollectionCarousel
        eyebrow="Just Landed"
        title="New Arrivals"
        sub="The newest additions to the boutique."
        slug="new-arrivals"
      />

      {/* EDITORIAL SPLIT */}
      <section className="bg-noir text-ivory">
        <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-auto">
            <img
              src={heroBlackGold.url}
              alt="Black satin with gold embroidery — MIRAVIKA campaign"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 md:px-16 md:py-28">
            <Reveal>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold">The Luxury Edit</p>
              <h2 className="mt-5 font-display text-[40px] leading-[1.02] md:text-7xl">
                Made for the moment you <span className="italic gold-gradient-text">arrive.</span>
              </h2>
              <p className="mt-6 max-w-md text-[14px] leading-[1.85] text-ivory/70 md:text-base">
                Polished finishes, considered details and the quiet confidence of pieces chosen to
                be worn again and again.
              </p>
              <EditorialCta slug="best-sellers" tone="light">
                Shop Best Sellers
              </EditorialCta>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <div className="bg-beige/50">
        <CollectionCarousel
          eyebrow="Best Sellers"
          title="Most Loved"
          sub="The pieces our customers return to, again and again."
          slug="best-sellers"
        />
      </div>

      {/* FILM — GIFTING */}
      <VideoSection
        src="/video/miravika-rakhi.mp4"
        poster="/video/miravika-rakhi-poster.jpg"
        eyebrow="Gifting Edit"
        title={
          <>
            Gifts wrapped in <span className="italic gold-gradient-text">gold.</span>
          </>
        }
        copy="Festive-ready keepsakes, presented in signature Miravika packaging — made to be remembered."
        ctaLabel="Shop Rakhi & Gifts"
        ctaSlug="gifts"
        align="right"
      />

      {/* TRENDING NOW */}
      <CollectionCarousel
        eyebrow="Trending Now"
        title="Of the Moment"
        sub="What everyone is reaching for this season."
        slug="trending-now"
      />

      {/* JEWELRY SPOTLIGHT */}
      <section className="bg-beige">
        <div className="mx-auto grid max-w-7xl items-center gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 md:order-1 md:px-16 md:py-28">
            <Reveal>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Earrings & Jewelry</p>
              <h2 className="mt-5 font-display text-[40px] leading-[1.02] md:text-7xl">
                Little things that <span className="italic gold-gradient-text">shine.</span>
              </h2>
              <p className="mt-6 max-w-md text-[14px] leading-[1.85] text-muted-foreground md:text-base">
                Studs, hoops, huggies and chains — everyday pieces with a polished finish, made to
                be layered, gifted and worn on repeat.
              </p>
              <EditorialCta slug="jewelry-accessories">Shop Earrings & Jewelry</EditorialCta>
            </Reveal>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden md:order-2 md:aspect-auto">
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

      {/* EARRINGS & JEWELRY */}
      <CollectionCarousel
        eyebrow="Earrings & Jewelry"
        title="Everyday Shine"
        sub="Studs, hoops and huggies to wear on repeat."
        slug="jewelry-accessories"
      />

      {/* HAIR ACCESSORIES */}
      <div className="bg-beige/50">
        <CollectionCarousel
          eyebrow="Hair Accessories"
          title="The Finishing Touch"
          sub="Claws, clips, bows and scrunchies designed to complete every look."
          slug="womens-fashion"
        />
      </div>

      {/* PROMISE */}
      <section aria-label="Our promise" className="border-y border-border/60 bg-ivory">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-6">
          {PROMISES.map((w, i) => (
            <Reveal
              as="li"
              key={w.title}
              delay={i * 60}
              className="flex flex-col items-center gap-3 text-center"
            >
              <w.icon className="h-6 w-6 text-gold" strokeWidth={1.2} aria-hidden="true" />
              <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/80">
                {w.title}
              </p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* CUSTOMER TESTIMONIALS (genuine published reviews only) */}
      <Testimonials />

      {/* CUSTOMER PHOTOS (from real photo reviews only) */}
      <CustomerGallery />

      {/* SHOP BY OCCASION */}
      <section
        aria-labelledby="occasion-heading"
        className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-32"
      >
        <Reveal className="mb-10 text-center md:mb-14">
          <p className="text-[10px] uppercase tracking-[0.34em] text-gold">Shop by Occasion</p>
          <h2
            id="occasion-heading"
            className="mt-3 font-display text-[34px] leading-tight md:text-6xl"
          >
            Considered Gifting
          </h2>
          <div className="animate-lux-draw mx-auto mt-5 h-px w-16 gold-line" />
        </Reveal>
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-7">
          {OCCASIONS.map((g, i) => (
            <Reveal as="li" key={g.title} delay={i * 90}>
              <Link
                to="/collection/$slug"
                params={{ slug: g.slug }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-beige shadow-[0_16px_40px_-30px_rgba(31,30,28,0.6)] transition-shadow duration-700 hover:shadow-[0_30px_60px_-30px_rgba(31,30,28,0.45)]"
              >
                <img
                  src={g.img}
                  alt={`${g.title} — MIRAVIKA gift edit`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{g.tag}</p>
                  <h3 className="mt-1.5 font-display text-3xl">{g.title}</h3>
                  <span className="mt-3 block h-px w-8 origin-left bg-gold transition-transform duration-700 group-hover:scale-x-[1.8]" />
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
            <h2
              id="story-heading"
              className="mt-5 font-display text-[40px] leading-[1.02] md:text-7xl"
            >
              A house built on <span className="italic gold-gradient-text">elegance.</span>
            </h2>
            <p className="mt-7 text-[14px] leading-[1.9] text-ivory/75 md:text-base">
              Miravika began with a simple idea — that luxury should feel personal, never distant.
              We create and curate accessories that bring a polished, considered finish to everyday
              style.
            </p>
            <p className="mt-4 text-[14px] leading-[1.9] text-ivory/60">
              Quality-checked, thoughtfully packaged and delivered with care across India.
            </p>
            <Link
              to="/about"
              className="group mt-10 inline-flex min-h-[52px] items-center gap-3 rounded-full border border-gold px-10 text-[11px] uppercase tracking-[0.26em] text-gold transition-colors duration-500 hover:bg-gold hover:text-noir"
            >
              Read Our Story
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section
        aria-labelledby="instagram-heading"
        className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-32"
      >
        <Reveal className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.34em] text-gold">@miravika.india</p>
          <h2
            id="instagram-heading"
            className="mt-3 font-display text-[34px] leading-tight md:text-6xl"
          >
            Follow the Journey
          </h2>
          <div className="mx-auto mt-5 h-px w-16 gold-line" />
        </Reveal>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {INSTAGRAM.map((src, i) => (
            <li key={src + i} className={i > 3 ? "hidden md:block" : undefined}>
              <a
                href="https://instagram.com/miravika.india"
                target="_blank"
                rel="noreferrer"
                aria-label="View MIRAVIKA on Instagram (opens in a new tab)"
                className="group relative block aspect-square overflow-hidden rounded-xl bg-beige"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-noir/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-ivory">
                    View on Instagram
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* NEWSLETTER */}
      <Newsletter />
    </div>
  );
}
