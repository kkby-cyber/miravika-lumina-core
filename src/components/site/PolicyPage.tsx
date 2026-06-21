import type { ReactNode } from "react";

export function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gold">MIRAVIKA</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">{title}</h1>
      <div className="mt-3 h-px w-20 gold-line" />
      <div className="prose prose-sm mt-8 max-w-none space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-foreground">
        {children}
      </div>
    </div>
  );
}
