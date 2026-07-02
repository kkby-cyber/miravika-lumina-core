import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle, Facebook } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logoAsset from "@/assets/miravika-logo.png.asset.json";

export function Footer() {
  const [email, setEmail] = useState("");
  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Welcome to the Miravika world", { description: "Check your inbox for a 10% welcome offer." });
    setEmail("");
  };

  return (
    <footer className="mt-24 bg-noir text-ivory">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-12 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Join the List</p>
          <h3 className="font-display text-3xl md:text-4xl">Everyday Luxury, Delivered.</h3>
          <p className="max-w-lg text-sm text-ivory/70">
            Sign up for private access to new drops, editorial stories and 10% off your first order.
          </p>
          <form onSubmit={onSubscribe} className="mt-2 flex w-full max-w-md items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
            />
            <button type="submit" className="rounded-full bg-gold px-6 py-3 text-xs uppercase tracking-[0.18em] text-noir hover:bg-gold/90">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <img src={logoAsset.url} alt="MIRAVIKA" className="h-16 w-auto brightness-110" />
          <p className="mt-4 text-sm text-ivory/70">
            Premium fashion, beauty and lifestyle accessories inspired by global trends. Worldwide shipping.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-white/20 p-2 hover:border-gold hover:text-gold">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border border-white/20 p-2 hover:border-gold hover:text-gold">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full border border-white/20 p-2 hover:border-gold hover:text-gold">
              <MessageCircle className="h-4 w-4" />
            </a>
            <a href="mailto:hello@miravika.com" aria-label="Email" className="rounded-full border border-white/20 p-2 hover:border-gold hover:text-gold">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link to="/collection/$slug" params={{ slug: "magnetic-earrings" }} className="hover:text-gold">Magnetic Earrings</Link></li>
            <li><Link to="/collection/$slug" params={{ slug: "fashion-accessories" }} className="hover:text-gold">Fashion Accessories</Link></li>
            <li><Link to="/collection/$slug" params={{ slug: "beauty-accessories" }} className="hover:text-gold">Beauty Accessories</Link></li>
            <li><Link to="/collection/$slug" params={{ slug: "hair-accessories" }} className="hover:text-gold">Hair Accessories</Link></li>
            <li><Link to="/collection/$slug" params={{ slug: "home-decor" }} className="hover:text-gold">Home Decor</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Help</h4>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link to="/track-order" className="hover:text-gold">Track Order</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-gold">Shipping Policy</Link></li>
            <li><Link to="/return-policy" className="hover:text-gold">Return Policy</Link></li>
            <li><Link to="/faq" className="hover:text-gold">FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-gold">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs tracking-wider text-ivory/50">
        © {new Date().getFullYear()} MIRAVIKA · Luxury Redefined · Made with love, worldwide.
      </div>
    </footer>
  );
}
