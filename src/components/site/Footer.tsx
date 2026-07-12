import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle, Facebook, ShieldCheck, Truck, Undo2, Headphones } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logoAsset from "@/assets/miravika-logo.png.asset.json";

const TRUST = [
  { icon: Truck, title: "Free Worldwide Shipping", sub: "On orders ₹2999+ / $49+" },
  { icon: Undo2, title: "Easy 7-Day Returns", sub: "No questions asked" },
  { icon: ShieldCheck, title: "Secure Checkout", sub: "SSL · Trusted gateways" },
  { icon: Headphones, title: "24/7 Support", sub: "We're here to help" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Welcome to Miravika", { description: "Check your inbox for 10% off your first order." });
    setEmail("");
  };

  return (
    <footer className="mt-24">
      {/* Trust strip */}
      <div className="border-y border-border/60 bg-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <t.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.4} />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em]">{t.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-noir text-ivory">
        {/* Newsletter */}
        <div className="border-b border-white/10">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-14 text-center">
            <p className="text-[10px] uppercase tracking-[0.32em] text-gold">The Miravika List</p>
            <h3 className="font-display text-3xl md:text-4xl">Everyday Luxury, Delivered.</h3>
            <p className="max-w-lg text-sm text-ivory/70">
              Private access to new drops, editorial stories and 10% off your first order.
            </p>
            <form onSubmit={onSubscribe} className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Email address"
                className="flex-1 rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
              />
              <button type="submit" className="rounded-full bg-gold px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-noir transition hover:bg-gold/90">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
          <div className="md:col-span-2">
            <img src={logoAsset.url} alt="MIRAVIKA" className="h-14 w-auto brightness-110" />
            <p className="mt-4 max-w-sm text-sm text-ivory/70">
              A premium lifestyle brand — fashion, jewelry, beauty and home essentials, carefully curated for the modern global woman.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { Icon: Instagram, href: "https://instagram.com/miravika", label: "Instagram" },
                { Icon: Facebook, href: "https://facebook.com/miravika", label: "Facebook" },
                { Icon: MessageCircle, href: "https://wa.me/", label: "WhatsApp" },
                { Icon: Mail, href: "mailto:hello@miravika.com", label: "Email" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold"
                >
                  <Icon className="h-[15px] w-[15px]" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
              <li><Link to="/collection/$slug" params={{ slug: "new-arrivals" }} className="hover:text-gold">New Arrivals</Link></li>
              <li><Link to="/collection/$slug" params={{ slug: "best-sellers" }} className="hover:text-gold">Best Sellers</Link></li>
              <li><Link to="/collection/$slug" params={{ slug: "womens-fashion" }} className="hover:text-gold">Women's Fashion</Link></li>
              <li><Link to="/collection/$slug" params={{ slug: "jewelry-accessories" }} className="hover:text-gold">Jewelry & Accessories</Link></li>
              <li><Link to="/collection/$slug" params={{ slug: "beauty-personal-care" }} className="hover:text-gold">Beauty</Link></li>
              <li><Link to="/collection/$slug" params={{ slug: "home-kitchen" }} className="hover:text-gold">Home & Kitchen</Link></li>
              <li><Link to="/collection/$slug" params={{ slug: "gifts" }} className="hover:text-gold">Gifts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Help</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
              <li><Link to="/track-order" className="hover:text-gold">Track Order</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-gold">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-gold">Returns & Refunds</Link></li>
              <li><Link to="/faq" className="hover:text-gold">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
              <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gold">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-[11px] tracking-wider text-ivory/50 md:flex-row">
            <p>© {new Date().getFullYear()} MIRAVIKA · Luxury Redefined</p>
            <p>Crafted worldwide · Delivered with care</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
