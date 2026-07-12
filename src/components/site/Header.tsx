import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import logoAsset from "@/assets/miravika-logo.png.asset.json";

type NavItem = {
  label: string;
  to?: "/shop" | "/collection/$slug";
  slug?: string;
  mega?: MegaColumn[];
};

type MegaColumn = { heading: string; links: { label: string; slug: string }[] };

// Primary nav — points at real Shopify collection handles
const NAV: NavItem[] = [
  { label: "New Arrivals", to: "/collection/$slug", slug: "new-arrivals" },
  { label: "Best Sellers", to: "/collection/$slug", slug: "best-sellers" },
  {
    label: "Women",
    to: "/collection/$slug",
    slug: "womens-fashion",
    mega: [
      {
        heading: "Shop",
        links: [
          { label: "All Fashion", slug: "womens-fashion" },
          { label: "New Arrivals", slug: "new-arrivals" },
          { label: "Best Sellers", slug: "best-sellers" },
          { label: "Trending Now", slug: "trending-now" },
        ],
      },
      {
        heading: "Curated",
        links: [
          { label: "Gifts", slug: "gifts" },
          { label: "Jewelry & Accessories", slug: "jewelry-accessories" },
          { label: "Beauty", slug: "beauty-personal-care" },
        ],
      },
    ],
  },
  {
    label: "Jewelry",
    to: "/collection/$slug",
    slug: "jewelry-accessories",
    mega: [
      {
        heading: "Shop Jewelry",
        links: [
          { label: "All Jewelry", slug: "jewelry-accessories" },
          { label: "New Arrivals", slug: "new-arrivals" },
          { label: "Best Sellers", slug: "best-sellers" },
        ],
      },
      {
        heading: "Occasions",
        links: [
          { label: "Gifts", slug: "gifts" },
          { label: "Trending Now", slug: "trending-now" },
        ],
      },
    ],
  },
  { label: "Beauty", to: "/collection/$slug", slug: "beauty-personal-care" },
  { label: "Home", to: "/collection/$slug", slug: "home-kitchen" },
  { label: "Tech", to: "/collection/$slug", slug: "electronics-accessories" },
  { label: "Gifts", to: "/collection/$slug", slug: "gifts" },
];

export function Header() {
  const totalItems = useCartStore((s) => s.items.reduce((a, b) => a + b.quantity, 0));
  const setOpen = useCartStore((s) => s.setOpen);
  const wishlistCount = useWishlistStore((s) => s.handles.length);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <header
      onMouseLeave={() => setHovered(null)}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/60 bg-ivory/95 backdrop-blur-md"
      }`}
    >
      <div className="bg-noir text-ivory">
        <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-[10px] tracking-[0.24em] uppercase md:text-[11px]">
          Worldwide Shipping · Free Delivery ₹2999+ / $49+ · Cash on Delivery in India
        </p>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:py-4">
        {/* LEFT: mobile menu + desktop nav */}
        <div className="flex items-center gap-1 md:flex-1">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="-ml-2 p-2 md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-ivory">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl tracking-[0.28em]">MIRAVIKA</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col">
                {NAV.map((n) => (
                  <Link
                    key={n.label}
                    to="/collection/$slug"
                    params={{ slug: n.slug! }}
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-border/40 px-1 py-3 text-sm tracking-wide hover:text-gold"
                  >
                    {n.label}
                  </Link>
                ))}
                <Link to="/shop" onClick={() => setMenuOpen(false)} className="border-b border-border/40 px-1 py-3 text-sm hover:text-gold">
                  Shop All
                </Link>
                <div className="my-4 gold-line" />
                <Link to="/track-order" onClick={() => setMenuOpen(false)} className="px-1 py-2 text-sm text-muted-foreground hover:text-gold">Track Order</Link>
                <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="px-1 py-2 text-sm text-muted-foreground hover:text-gold">Wishlist</Link>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="px-1 py-2 text-sm text-muted-foreground hover:text-gold">Account</Link>
                <Link to="/about" onClick={() => setMenuOpen(false)} className="px-1 py-2 text-sm text-muted-foreground hover:text-gold">About</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)} className="px-1 py-2 text-sm text-muted-foreground hover:text-gold">Contact</Link>
                <Link to="/faq" onClick={() => setMenuOpen(false)} className="px-1 py-2 text-sm text-muted-foreground hover:text-gold">FAQs</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.slice(0, 4).map((n) => (
              <div
                key={n.label}
                onMouseEnter={() => setHovered(n.mega ? n.label : null)}
                className="relative"
              >
                <Link
                  to="/collection/$slug"
                  params={{ slug: n.slug! }}
                  className="inline-flex items-center gap-1 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground/80 transition hover:text-gold"
                >
                  {n.label}
                  {n.mega && <ChevronDown className="h-3 w-3 opacity-60" />}
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* CENTER: Logo */}
        <Link to="/" className="flex flex-shrink-0 items-center justify-center" aria-label="MIRAVIKA — Home">
          <img
            src={logoAsset.url}
            alt="MIRAVIKA — Luxury Redefined"
            className="h-11 w-auto md:h-14"
            width={220}
            height={64}
          />
        </Link>

        {/* RIGHT: nav + icons */}
        <div className="flex items-center justify-end gap-0.5 md:flex-1">
          <nav className="mr-3 hidden items-center gap-6 lg:flex">
            {NAV.slice(4).map((n) => (
              <div
                key={n.label}
                onMouseEnter={() => setHovered(n.mega ? n.label : null)}
                className="relative"
              >
                <Link
                  to="/collection/$slug"
                  params={{ slug: n.slug! }}
                  className="inline-flex items-center gap-1 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground/80 transition hover:text-gold"
                >
                  {n.label}
                </Link>
              </div>
            ))}
          </nav>
          <Link to="/search" aria-label="Search" className="p-2 transition hover:text-gold">
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <Link to="/account" aria-label="Account" className="hidden p-2 transition hover:text-gold sm:block">
            <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <Link to="/wishlist" aria-label={`Wishlist (${wishlistCount})`} className="relative p-2 transition hover:text-gold">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-gold px-1 text-[9px] font-semibold text-gold-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            aria-label={`Cart (${totalItems})`}
            onClick={() => setOpen(true)}
            className="relative p-2 transition hover:text-gold"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-gold px-1 text-[9px] font-semibold text-gold-foreground">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MEGA MENU */}
      {hovered && (() => {
        const item = NAV.find((n) => n.label === hovered);
        if (!item?.mega) return null;
        return (
          <div
            onMouseEnter={() => setHovered(item.label)}
            className="absolute left-0 right-0 top-full hidden border-t border-border/60 bg-ivory shadow-[0_20px_40px_-20px_rgba(0,0,0,0.15)] lg:block"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-4 gap-10 px-6 py-10">
              {item.mega.map((col) => (
                <div key={col.heading}>
                  <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-gold">{col.heading}</p>
                  <ul className="space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l.slug}>
                        <Link
                          to="/collection/$slug"
                          params={{ slug: l.slug }}
                          onClick={() => setHovered(null)}
                          className="text-sm text-foreground/85 transition hover:text-gold"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="col-span-2 flex items-end justify-end">
                <Link
                  to="/collection/$slug"
                  params={{ slug: item.slug! }}
                  onClick={() => setHovered(null)}
                  className="text-[11px] uppercase tracking-[0.22em] text-foreground/70 underline-offset-4 hover:text-gold hover:underline"
                >
                  Shop the entire {item.label} edit →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}
    </header>
  );
}
