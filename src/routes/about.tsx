import { createFileRoute } from "@tanstack/react-router";
import { Globe2, Sparkles, ShieldCheck, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MIRAVIKA — Premium Global Lifestyle Brand" },
      {
        name: "description",
        content:
          "MIRAVIKA is a premium global lifestyle brand curating fashion, jewelry, beauty, home and lifestyle essentials for the modern customer. Worldwide shipping.",
      },
      { property: "og:title", content: "About MIRAVIKA — Premium Global Lifestyle Brand" },
      {
        property: "og:description",
        content:
          "Affordable luxury, thoughtfully curated. Discover the story behind MIRAVIKA.",
      },
    ],
    links: [{ rel: "canonical", href: "https://miravika-lumina-core.lovable.app/about" }],
  }),
  component: About,
});

const PILLARS = [
  { icon: Sparkles, title: "Affordable Luxury", body: "Premium design and materials at prices that make everyday moments feel special." },
  { icon: Globe2, title: "Global Curation", body: "A trend-forward edit sourced from studios and makers across the world." },
  { icon: ShieldCheck, title: "Trusted Shopping", body: "Secure payments, transparent policies and easy returns — every order, every time." },
  { icon: Heart, title: "Customer First", body: "A responsive support team obsessed with getting every detail right for you." },
];

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:py-24">
      <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Our story</p>
      <h1 className="mt-3 font-display text-4xl md:text-6xl">Luxury, redefined for the modern world.</h1>
      <div className="my-8 h-px w-20 gold-line" />
      <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
        <p>
          MIRAVIKA is a premium global lifestyle brand built for people who care about how the small things feel — the weight of a chain, the pour of a candle, the finish of a leather strap. We curate fashion, jewelry, beauty, home and lifestyle essentials into one considered edit, so shopping stays effortless and stays elevated.
        </p>
        <p>
          We work with design studios and trusted partners across the world to bring you products that feel considered, not commoditised. Every piece is reviewed for quality, packaging and after-sales support before it earns a place in the MIRAVIKA edit.
        </p>
        <p>
          We ship worldwide, offer Cash on Delivery across India, and stand behind every order with easy 7-day returns and a support team that actually replies. Thank you for shopping with us — you're the reason we obsess over the details.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-lg border border-border/60 bg-card p-6">
            <p.icon className="h-5 w-5 text-gold" strokeWidth={1.4} />
            <h3 className="mt-4 font-display text-xl">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
