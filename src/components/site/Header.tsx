import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV = [
  { label: "Shop All", to: "/shop" as const, search: undefined },
  { label: "Scrunchies", to: "/collection/$slug" as const, params: { slug: "scrunchies" } },
  { label: "Bows", to: "/collection/$slug" as const, params: { slug: "bows" } },
  { label: "Clips", to: "/collection/$slug" as const, params: { slug: "clips" } },
  { label: "Bands", to: "/collection/$slug" as const, params: { slug: "bands" } },
  { label: "Accessories", to: "/collection/$slug" as const, params: { slug: "accessories" } },
];

export function Header() {
  const totalItems = useCartStore((s) => s.items.reduce((a, b) => a + b.quantity, 0));
  const setOpen = useCartStore((s) => s.setOpen);
  const wishlistCount = useWishlistStore((s) => s.handles.length);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-ivory/85 backdrop-blur-md">
      <div className="border-b border-border/40 bg-foreground/95 text-ivory">
        <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-[11px] tracking-[0.18em] uppercase">
          Free shipping on prepaid orders above ₹999 · COD available across India
        </p>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="-ml-2 p-2 md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">MIRAVIKA</SheetTitle>
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
        </div>

        <Link to="/" className="flex-1 text-center md:flex-none md:text-left">
          <span className="font-display text-2xl tracking-[0.28em] md:text-3xl">MIRAVIKA</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-7 md:flex">
          {NAV.map((n) =>
            n.params ? (
              <Link
                key={n.label}
                to={n.to}
                params={n.params}
                className="text-[12px] uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground"
              >
                {n.label}
              </Link>
            ) : (
              <Link key={n.label} to="/shop" className="text-[12px] uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground">
                {n.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-1">
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
