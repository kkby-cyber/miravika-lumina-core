import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-beige/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl tracking-[0.2em]">MIRAVIKA</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Handcrafted hair accessories for the modern Indian woman. Designed to feel like an heirloom.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-border/70 p-2 hover:border-gold hover:text-gold">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full border border-border/70 p-2 hover:border-gold hover:text-gold">
              <MessageCircle className="h-4 w-4" />
            </a>
            <a href="mailto:hello@miravika.in" aria-label="Email" className="rounded-full border border-border/70 p-2 hover:border-gold hover:text-gold">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/collection/$slug" params={{ slug: "scrunchies" }} className="hover:text-gold">Hair Scrunchies</Link></li>
            <li><Link to="/collection/$slug" params={{ slug: "bows" }} className="hover:text-gold">Hair Bows</Link></li>
            <li><Link to="/collection/$slug" params={{ slug: "clips" }} className="hover:text-gold">Hair Clips</Link></li>
            <li><Link to="/collection/$slug" params={{ slug: "bands" }} className="hover:text-gold">Hair Bands</Link></li>
            <li><Link to="/collection/$slug" params={{ slug: "accessories" }} className="hover:text-gold">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Help</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/track-order" className="hover:text-gold">Track Order</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-gold">Shipping Policy</Link></li>
            <li><Link to="/return-policy" className="hover:text-gold">Return Policy</Link></li>
            <li><Link to="/faq" className="hover:text-gold">FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-gold">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs tracking-wider text-muted-foreground">
        © {new Date().getFullYear()} MIRAVIKA · Made in India with love
      </div>
    </footer>
  );
}
