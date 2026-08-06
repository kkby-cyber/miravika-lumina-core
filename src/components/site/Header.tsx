import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import logoAsset from "@/assets/miravika-logo.png.asset.json";

type NavItem = { label: string; slug: string };

// Synchronized with live Shopify collections. Order per brand direction.
const NAV: NavItem[] = [
  { label: "New Arrivals", slug: "new-arrivals" },
  { label: "Trending Now", slug: "trending-now" },
  { label: "Women's Fashion", slug: "womens-fashion" },
  { label: "Jewelry & Accessories", slug: "jewelry-accessories" },
  { label: "Beauty & Personal Care", slug: "beauty-personal-care" },
  { label: "Home & Kitchen", slug: "home-kitchen" },
  { label: "Electronics & Accessories", slug: "electronics-accessories" },
  { label: "Gifts", slug: "gifts" },
  { label: "Best Sellers", slug: "best-sellers" },
];

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
    const id = setInterval(() => setAnnounceIdx((i) => (i + 1) % ANNOUNCEMENTS.length), 6500);
    return () => clearInterval(id);
  }, []);


  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const transparent = isHome && !scrolled;

  return (
    <header
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
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 md:h-[80px] md:px-8">
        {/* LEFT: mobile menu button */}
        <div className="flex flex-1 items-center lg:flex-none">
          <button
            aria-label="Open menu"
            className="-ml-2 p-2 lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-[22px] w-[22px]" strokeWidth={1.25} />
          </button>
        </div>

        {/* CENTER LOGO */}
        <Link to="/" aria-label="MIRAVIKA — Home" className="flex flex-none items-center justify-center">
          <img
            src={logoAsset.url}
            alt="MIRAVIKA — Luxury Redefined"
            className="h-9 w-auto md:h-12"
            width={220}
            height={56}
          />
        </Link>

        {/* RIGHT: icons */}
        <div className="flex flex-1 items-center justify-end gap-0.5 lg:flex-none">
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

      {/* DESKTOP NAV ROW — single centered row, luxury spacing */}
      <nav className={`hidden border-t transition-colors duration-500 lg:block ${transparent ? "border-white/10" : "border-border/30"}`}>
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-8 py-3.5 xl:gap-10">
          {NAV.map((n) => (
            <li key={n.slug}>
              <Link
                to="/collection/$slug"
                params={{ slug: n.slug }}
                className="group relative py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/85 transition-colors hover:text-foreground"
                activeProps={{ className: "text-gold" }}
              >
                {n.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* MOBILE FULL-SCREEN MENU */}
      <div
        className={`fixed inset-0 z-50 bg-ivory transition-opacity duration-500 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-[68px] items-center justify-between border-b border-border/30 px-5">
          <span className="font-display text-lg tracking-[0.32em]">MENU</span>
          <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-2">
            <X className="h-[22px] w-[22px]" strokeWidth={1.25} />
          </button>
        </div>
        <nav className={`flex flex-col overflow-y-auto px-6 py-6 transition-all duration-500 ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {NAV.map((n, i) => (
            <Link
              key={n.slug}
              to="/collection/$slug"
              params={{ slug: n.slug }}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: `${i * 30}ms` }}
              className="border-b border-border/20 py-4 text-base font-light tracking-wide transition-colors hover:text-gold"
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
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
