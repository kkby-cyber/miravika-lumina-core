import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
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

const NAV = [
  { label: "Shop All", to: "/shop" as const, params: undefined },
  { label: "Magnetic Earrings", to: "/collection/$slug" as const, params: { slug: "magnetic-earrings" } },
  { label: "Fashion", to: "/collection/$slug" as const, params: { slug: "fashion-accessories" } },
  { label: "Beauty", to: "/collection/$slug" as const, params: { slug: "beauty-accessories" } },
  { label: "Hair", to: "/collection/$slug" as const, params: { slug: "hair-accessories" } },
  { label: "Home Decor", to: "/collection/$slug" as const, params: { slug: "home-decor" } },
];

export function Header() {
  const totalItems = useCartStore((s) => s.items.reduce((a, b) => a + b.quantity, 0));
  const setOpen = useCartStore((s) => s.setOpen);
  const wishlistCount = useWishlistStore((s) => s.handles.length);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
      className={`sticky top-0 z-40 transition-all duration-300 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/60 bg-ivory/95 backdrop-blur-md"
      }`}
    >
      <div className="bg-noir text-ivory">
        <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-[11px] tracking-[0.2em] uppercase">
          Worldwide Shipping · Free Delivery Over ₹999 / $49 · COD in India
        </p>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 md:flex-1">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="-ml-2 p-2 md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-ivory">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl tracking-[0.28em]">MIRAVIKA</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV.map((n) =>
                  n.params ? (
                    <Link
                      key={n.label}
                      to={n.to}
                      params={n.params}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm tracking-wide hover:bg-beige"
                    >
                      {n.label}
                    </Link>
                  ) : (
                    <Link
                      key={n.label}
                      to="/shop"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm tracking-wide hover:bg-beige"
                    >
                      {n.label}
                    </Link>
                  ),
                )}
                <div className="my-3 gold-line" />
                <Link to="/track-order" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2.5 text-sm hover:bg-beige">Track Order</Link>
                <Link to="/about" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2.5 text-sm hover:bg-beige">About</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2.5 text-sm hover:bg-beige">Contact</Link>
                <Link to="/faq" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2.5 text-sm hover:bg-beige">FAQs</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV.slice(0, 4).map((n) =>
              n.params ? (
                <Link
                  key={n.label}
                  to={n.to}
                  params={n.params}
                  className="text-[11px] uppercase tracking-[0.2em] text-foreground/80 hover:text-gold"
                >
                  {n.label}
                </Link>
              ) : (
                <Link key={n.label} to="/shop" className="text-[11px] uppercase tracking-[0.2em] text-foreground/80 hover:text-gold">
                  {n.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <Link to="/" className="flex flex-shrink-0 items-center justify-center">
          <img src={logoAsset.url} alt="MIRAVIKA — Luxury Redefined" className="h-12 w-auto md:h-16" />
        </Link>

        <div className="flex items-center justify-end gap-1 md:flex-1">
          <nav className="mr-2 hidden items-center gap-6 md:flex">
            {NAV.slice(4).map((n) => (
              <Link
                key={n.label}
                to={n.to}
                params={n.params}
                className="text-[11px] uppercase tracking-[0.2em] text-foreground/80 hover:text-gold"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link to="/search" aria-label="Search" className="p-2 hover:text-gold">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/account" aria-label="Account" className="hidden p-2 hover:text-gold sm:block">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative p-2 hover:text-gold">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-semibold text-gold-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button aria-label="Cart" onClick={() => setOpen(true)} className="relative p-2 hover:text-gold">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-semibold text-gold-foreground">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
