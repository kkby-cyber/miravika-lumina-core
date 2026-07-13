import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import logoAsset from "@/assets/miravika-logo.png.asset.json";

type MegaColumn = { heading: string; links: { label: string; slug: string }[] };
type NavItem = { label: string; slug: string; mega?: MegaColumn[] };

const LEFT_NAV: NavItem[] = [
  {
    label: "Women",
    slug: "womens-fashion",
    mega: [
      {
        heading: "Shop",
        links: [
          { label: "All Fashion", slug: "womens-fashion" },
          { label: "Dresses", slug: "womens-fashion" },
          { label: "Tops", slug: "womens-fashion" },
          { label: "Bottoms", slug: "womens-fashion" },
          { label: "Accessories", slug: "jewelry-accessories" },
        ],
      },
      {
        heading: "Discover",
        links: [
          { label: "New Arrivals", slug: "new-arrivals" },
          { label: "Best Sellers", slug: "best-sellers" },
          { label: "Trending Now", slug: "trending-now" },
        ],
      },
    ],
  },
  {
    label: "Jewelry",
    slug: "jewelry-accessories",
    mega: [
      {
        heading: "Shop Jewelry",
        links: [
          { label: "All Jewelry", slug: "jewelry-accessories" },
          { label: "Necklaces", slug: "jewelry-accessories" },
          { label: "Earrings", slug: "jewelry-accessories" },
          { label: "Rings", slug: "jewelry-accessories" },
          { label: "Bracelets", slug: "jewelry-accessories" },
        ],
      },
      {
        heading: "Occasions",
        links: [
          { label: "Gifts", slug: "gifts" },
          { label: "New Arrivals", slug: "new-arrivals" },
        ],
      },
    ],
  },
  {
    label: "Beauty",
    slug: "beauty-personal-care",
    mega: [
      {
        heading: "Beauty",
        links: [
          { label: "All Beauty", slug: "beauty-personal-care" },
          { label: "Skincare", slug: "beauty-personal-care" },
          { label: "Makeup", slug: "beauty-personal-care" },
          { label: "Hair Care", slug: "beauty-personal-care" },
        ],
      },
    ],
  },
];

const RIGHT_NAV: NavItem[] = [
  {
    label: "Home",
    slug: "home-kitchen",
    mega: [
      {
        heading: "Home & Living",
        links: [
          { label: "All Home", slug: "home-kitchen" },
          { label: "Kitchen", slug: "home-kitchen" },
          { label: "Décor", slug: "home-kitchen" },
        ],
      },
    ],
  },
  { label: "Tech", slug: "electronics-accessories" },
  { label: "Gifts", slug: "gifts" },
];

const ALL_NAV = [...LEFT_NAV, ...RIGHT_NAV];

const ANNOUNCEMENTS = [
  "Complimentary Worldwide Shipping on Orders ₹2999+ / $49+",
  "Easy 7-Day Returns · Hassle-Free Exchange",
  "Secure Checkout · Cash on Delivery in India",
  "Discover the New Season — Curated with Care",
];

export function Header() {
  const totalItems = useCartStore((s) => s.items.reduce((a, b) => a + b.quantity, 0));
  const setOpen = useCartStore((s) => s.setOpen);
  const wishlistCount = useWishlistStore((s) => s.handles.length);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [announceIdx, setAnnounceIdx] = useState(0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setAnnounceIdx((i) => (i + 1) % ANNOUNCEMENTS.length), 4200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const transparent = isHome && !scrolled && !hovered;

  return (
    <header
      onMouseLeave={() => setHovered(null)}
      className={`sticky top-0 z-40 transition-all duration-500 ${
        transparent
          ? "bg-transparent"
          : "bg-ivory/95 backdrop-blur-md " + (scrolled ? "shadow-[0_1px_20px_-10px_rgba(0,0,0,0.15)]" : "")
      }`}
    >
      {/* Announcement bar */}
      <div className={`overflow-hidden border-b transition-colors duration-500 ${transparent ? "border-white/10 bg-noir/40 text-ivory" : "border-border/40 bg-noir text-ivory"}`}>
        <div className="relative mx-auto h-8 max-w-7xl px-4">
          {ANNOUNCEMENTS.map((msg, i) => (
            <p
              key={i}
              className={`absolute inset-0 flex items-center justify-center text-center text-[10.5px] font-light tracking-[0.28em] uppercase transition-all duration-700 ${
                i === announceIdx ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
              }`}
            >
              {msg}
            </p>
          ))}
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto grid h-[76px] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:h-[80px] md:px-8 lg:grid-cols-3">
        {/* LEFT */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Open menu"
            className="-ml-2 p-2 lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-[20px] w-[20px]" strokeWidth={1.25} />
          </button>
          <nav className="hidden items-center gap-9 lg:flex">
            {LEFT_NAV.map((n) => (
              <NavLink key={n.label} item={n} onHover={setHovered} active={hovered === n.label} />
            ))}
          </nav>
        </div>

        {/* CENTER LOGO */}
        <div className="flex items-center justify-center">
          <Link to="/" aria-label="MIRAVIKA — Home" className="flex items-center">
            <img
              src={logoAsset.url}
              alt="MIRAVIKA — Luxury Redefined"
              className="h-10 w-auto md:h-12"
              width={220}
              height={56}
            />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-1">
          <nav className="mr-6 hidden items-center gap-9 lg:flex">
            {RIGHT_NAV.map((n) => (
              <NavLink key={n.label} item={n} onHover={setHovered} active={hovered === n.label} />
            ))}
          </nav>
          <Link to="/search" aria-label="Search" className="p-2.5 transition-colors hover:text-gold">
            <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
          </Link>
          <Link to="/account" aria-label="Account" className="hidden p-2.5 transition-colors hover:text-gold sm:block">
            <User className="h-[18px] w-[18px]" strokeWidth={1.25} />
          </Link>
          <Link to="/wishlist" aria-label={`Wishlist (${wishlistCount})`} className="relative p-2.5 transition-colors hover:text-gold">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-gold px-1 text-[9px] font-medium text-gold-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            aria-label={`Cart (${totalItems})`}
            onClick={() => setOpen(true)}
            className="relative p-2.5 transition-colors hover:text-gold"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-gold px-1 text-[9px] font-medium text-gold-foreground">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MEGA MENU */}
      {hovered && (() => {
        const item = ALL_NAV.find((n) => n.label === hovered);
        if (!item?.mega) return null;
        return (
          <div
            onMouseEnter={() => setHovered(item.label)}
            className="absolute left-0 right-0 top-full hidden animate-fade-in border-t border-border/40 bg-ivory shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)] lg:block"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-4 gap-12 px-8 py-12">
              {item.mega.map((col) => (
                <div key={col.heading}>
                  <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.3em] text-gold">{col.heading}</p>
                  <ul className="space-y-3">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          to="/collection/$slug"
                          params={{ slug: l.slug }}
                          onClick={() => setHovered(null)}
                          className="story-link text-[13px] font-light tracking-wide text-foreground/80 transition hover:text-foreground"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="col-span-1 col-start-4 flex items-end justify-end">
                <Link
                  to="/collection/$slug"
                  params={{ slug: item.slug }}
                  onClick={() => setHovered(null)}
                  className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 underline-offset-4 hover:text-gold hover:underline"
                >
                  Shop all {item.label} →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MOBILE FULL-SCREEN MENU */}
      <div
        className={`fixed inset-0 z-50 bg-ivory transition-opacity duration-500 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-border/30 px-5">
          <span className="font-display text-xl tracking-[0.32em]">MENU</span>
          <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-2">
            <X className="h-[22px] w-[22px]" strokeWidth={1.25} />
          </button>
        </div>
        <nav className={`flex flex-col px-6 py-8 transition-all duration-500 ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {ALL_NAV.map((n, i) => (
            <Link
              key={n.label}
              to="/collection/$slug"
              params={{ slug: n.slug }}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: `${i * 40}ms` }}
              className="border-b border-border/20 py-5 text-lg font-light tracking-wide transition-colors hover:text-gold"
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-10 flex flex-col gap-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <Link to="/account" onClick={() => setMenuOpen(false)} className="hover:text-gold">Account</Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="hover:text-gold">Wishlist</Link>
            <Link to="/track-order" onClick={() => setMenuOpen(false)} className="hover:text-gold">Track Order</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="hover:text-gold">Contact</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  item,
  active,
  onHover,
}: {
  item: NavItem;
  active: boolean;
  onHover: (label: string | null) => void;
}) {
  return (
    <div onMouseEnter={() => onHover(item.mega ? item.label : null)} className="relative">
      <Link
        to="/collection/$slug"
        params={{ slug: item.slug }}
        className={`relative py-2 text-[11px] font-medium uppercase tracking-[0.24em] transition-colors ${
          active ? "text-gold" : "text-foreground/80 hover:text-foreground"
        }`}
      >
        {item.label}
        <span
          className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gold transition-transform duration-300 ${
            active ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </Link>
    </div>
  );
}
