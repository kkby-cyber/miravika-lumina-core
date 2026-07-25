import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { trackGenerateLead } from "@/lib/analytics";

const KEY = "miravika-exit-offer-seen";

/**
 * Luxury exit-intent capture. Desktop: pointer leaves the viewport.
 * Mobile: a decisive upward scroll after the visitor has engaged.
 * Shown at most once per browser (localStorage) and never on checkout pages.
 */
export function ExitIntent() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return;
    }

    let armed = false;
    const arm = window.setTimeout(() => (armed = true), 12000);

    const show = () => {
      if (!armed) return;
      setOpen(true);
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      cleanup();
    };

    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (lastY - y > 320 && y < 400) show();
      lastY = y;
    };

    const cleanup = () => {
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };

    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(arm);
      cleanup();
    };
  }, []);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    trackGenerateLead("exit_intent_offer");
    toast.success("Welcome to MIRAVIKA", { description: "Your 10% welcome code is on its way." });
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-noir/60 p-4 backdrop-blur-sm animate-in fade-in duration-300 sm:items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-gold/30 bg-ivory p-8 text-center shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-beige"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Before you go</p>
        <h3 className="mt-2 font-display text-3xl">Enjoy 10% off</h3>
        <div className="mx-auto mt-3 h-px w-16 gold-line" />
        <p className="mt-3 text-sm text-muted-foreground">
          Join The MIRAVIKA List for private access to new drops — and 10% off your first order.
        </p>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            aria-label="Email address"
            className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-foreground py-3 text-[11px] uppercase tracking-[0.22em] text-ivory transition hover:bg-foreground/90"
          >
            Claim my 10%
          </button>
        </form>
        <button onClick={() => setOpen(false)} className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-gold">
          No thanks
        </button>
      </div>
    </div>
  );
}
