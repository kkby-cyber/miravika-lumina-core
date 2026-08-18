import { useRef, useState } from "react";
import { Expand, X } from "lucide-react";

/**
 * Premium gallery viewer: hover/touch magnification plus a full-screen lightbox.
 * Pure presentation — no layout or branding change to the surrounding page.
 */
export function ZoomableImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [lightbox, setLightbox] = useState(false);

  // Shopify CDN supports on-the-fly resizing — serve crisp, high-resolution art.
  const sized = (w: number) => {
    try {
      const u = new URL(src);
      u.searchParams.set("width", String(w));
      return u.toString();
    } catch {
      return src;
    }
  };
  const srcSet = [800, 1200, 1600, 2048].map((w) => `${sized(w)} ${w}w`).join(", ");


  const move = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    setOrigin(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  };

  return (
    <>
      <div
        ref={ref}
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-beige"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => move(e.clientX, e.clientY)}
        onClick={() => setLightbox(true)}
        role="button"
        tabIndex={0}
        aria-label={`Zoom image: ${alt}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setLightbox(true);
        }}
      >
        <img
          src={sized(1200)}
          srcSet={srcSet}
          sizes="(min-width: 768px) 640px, 100vw"
          alt={alt}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-200 ease-out"
          style={{ transform: zoom ? "scale(1.9)" : "scale(1)", transformOrigin: origin }}
        />
        <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 rounded-full bg-ivory/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-foreground shadow-sm md:inline-flex">
          <Expand className="h-3 w-3 text-gold" /> Zoom
        </span>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-noir/95 p-4"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            onClick={() => setLightbox(false)}
            aria-label="Close image"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-ivory/25 text-ivory"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={sized(2048)} alt={alt} className="max-h-[90vh] max-w-full object-contain" />
        </div>
      )}
    </>
  );
}
