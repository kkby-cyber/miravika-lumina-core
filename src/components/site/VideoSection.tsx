import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

/**
 * Cinematic full-bleed video band. Autoplays muted in view, pauses out of view,
 * and lets the visitor unmute. Poster keeps LCP fast.
 */
export function VideoSection({
  src,
  poster,
  eyebrow,
  title,
  copy,
  ctaLabel,
  ctaSlug,
  align = "left",
}: {
  src: string;
  poster: string;
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
  ctaLabel: string;
  ctaSlug: string;
  align?: "left" | "right";
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting;
        if (visible) void el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => undefined);
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="bg-noir text-ivory">
      <div
        className={`mx-auto grid max-w-7xl items-center gap-0 md:grid-cols-2 ${
          align === "right" ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
          <video
            ref={ref}
            src={src}
            poster={poster}
            muted={muted}
            loop
            playsInline
            preload="none"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/55 via-transparent to-transparent" />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={toggle}
              aria-label={playing ? "Pause film" : "Play film"}
              className="grid h-10 w-10 place-items-center rounded-full bg-noir/50 text-ivory backdrop-blur transition hover:bg-noir/75"
            >
              {playing ? <Pause className="h-4 w-4" strokeWidth={1.5} /> : <Play className="h-4 w-4" strokeWidth={1.5} />}
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute film" : "Mute film"}
              className="grid h-10 w-10 place-items-center rounded-full bg-noir/50 text-ivory backdrop-blur transition hover:bg-noir/75"
            >
              {muted ? <VolumeX className="h-4 w-4" strokeWidth={1.5} /> : <Volume2 className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-16 md:px-16 md:py-28">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">{eyebrow}</p>
            <h2 className="mt-5 font-display text-[34px] leading-[1.05] md:text-6xl">{title}</h2>
            <p className="mt-6 max-w-md text-[14px] leading-[1.85] text-ivory/70 md:text-base">{copy}</p>
            <Link
              to="/collection/$slug"
              params={{ slug: ctaSlug }}
              className="group mt-10 inline-flex min-h-[52px] w-fit items-center gap-3 rounded-full border border-gold px-10 text-[11px] uppercase tracking-[0.26em] text-gold transition-all duration-500 hover:bg-gold hover:text-noir"
            >
              {ctaLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
