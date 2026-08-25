import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

type NavItem = { label: string; slug: string };

// Canonical MIRAVIKA categories — backed by live Shopify collections (see COLLECTION_HANDLE_MAP).
const NAV: NavItem[] = [
  { label: "Signature Collection", slug: "signature-collection" },
  { label: "New Arrivals", slug: "new-arrivals" },
  { label: "Ready-to-Wear", slug: "ready-to-wear" },
  { label: "Accessories Fine Goods", slug: "accessories-fine-goods" },
  { label: "Curated Sets", slug: "curated-sets" },
];

const ANNOUNCEMENTS = [
  "Complimentary Worldwide Shipping on Orders ₹2999+ / $49+",
  "Easy 7-Day Returns · Hassle-Free Exchange",
  "Secure Encrypted Checkout · UPI, Cards & Net Banking",
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
      className={`sticky top-0 z-40 transition-all duration-700 ${
        transparent
          ? "bg-transparent"
          : "bg-ivory/80 backdrop-blur-xl backdrop-saturate-150 " +
            (scrolled ? "shadow-[0_10px_40px_-28px_rgba(17,17,17,0.55)]" : "")
      }`}
    >
      {/* Announcement bar — one message at a time, slow crossfade */}
      <div
        className={`overflow-hidden border-b transition-colors duration-700 ${transparent ? "border-white/10 bg-noir/45 text-ivory" : "border-border/40 bg-noir text-ivory"}`}
      >
        <div className="relative mx-auto h-9 max-w-7xl px-4" aria-live="polite">
          {ANNOUNCEMENTS.map((msg, i) => (
            <p
              key={i}
              aria-hidden={i !== announceIdx}
              className={`absolute inset-0 flex items-center justify-center text-center text-[10px] font-light uppercase tracking-[0.3em] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] md:text-[10.5px] ${
                i === announceIdx ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              {msg}
            </p>
          ))}
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 md:h-[92px] md:px-8">
        {/* LEFT: menu button (mobile) + logo */}
        <div className="flex min-w-0 items-center gap-1">
          <button
            aria-label="Open menu"
            className="-ml-2 grid h-11 w-11 place-items-center lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-[22px] w-[22px]" strokeWidth={1.25} />
          </button>

          <Link to="/" aria-label="MIRAVIKA — Home" className="flex items-center">
            <img
              src="/miravika-logo-gold.png"
              alt="MIRAVIKA — Luxury Redefined"
              className="h-11 w-auto transition-all duration-500 md:h-[62px]"
              width={675}
              height={592}
              fetchPriority="high"
            />
          </Link>
        </div>

        {/* RIGHT: icons */}
        <div className="flex items-center justify-end gap-0.5">
          <Link to="/search" aria-label="Search" className="grid h-11 w-11 place-items-center transition-colors hover:text-gold">
            <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
          </Link>
          <Link to="/account" aria-label="Account" className="hidden h-11 w-11 place-items-center transition-colors hover:text-gold sm:grid">
            <User className="h-[18px] w-[18px]" strokeWidth={1.25} />
          </Link>
          <Link to="/wishlist" aria-label={`Wishlist (${wishlistCount})`} className="relative grid h-11 w-11 place-items-center transition-colors hover:text-gold">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
            {wishlistCount > 0 && (
              <span className="absolute right-1 top-1.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-gold px-1 text-[9px] font-medium text-gold-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            aria-label={`Cart (${totalItems})`}
            onClick={() => setOpen(true)}
            className="relative grid h-11 w-11 place-items-center transition-colors hover:text-gold"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} />
            {totalItems > 0 && (
              <span className="absolute right-1 top-1.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-gold px-1 text-[9px] font-medium text-gold-foreground">
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
