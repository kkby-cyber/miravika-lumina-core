import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — MIRAVIKA" }, { name: "description", content: "MIRAVIKA crafts heirloom hair accessories from a small atelier in Jaipur." }] }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Our story</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">A love letter to handcraft.</h1>
      <div className="mx-auto my-8 h-px w-20 gold-line" />
      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground md:text-base">
        <p>
          MIRAVIKA was born in 2024 from a simple idea — that hair accessories should feel like jewellery, not afterthoughts. Each piece is hand-finished by a tiny team of women artisans in Jaipur, using mulberry silk, French satin and recycled brass.
        </p>
        <p>
          We move slowly on purpose. No mass production, no plastic, no compromises. We design for the woman who notices the small things — the weight of a scrunchie, the curve of a bow, the way a clip catches the light.
        </p>
        <p>
          Thank you for choosing MIRAVIKA. Every order helps us pay our artisans a fair wage and keep traditional craft alive.
        </p>
      </div>
    </div>
  );
}
