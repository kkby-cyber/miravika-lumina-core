import { Star } from "lucide-react";

export function Stars({
  rating,
  size = 14,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i - 0.25;
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            strokeWidth={1.5}
            className={filled ? "fill-gold text-gold" : "text-muted-foreground/40"}
          />
        );
      })}
    </span>
  );
}

/** Compact inline rating used on product cards. Renders nothing without real data. */
export function InlineRating({ average, count }: { average?: number; count?: number }) {
  if (!average || !count) return null;
  return (
    <span className="mt-1 inline-flex items-center gap-1.5">
      <Stars rating={average} size={11} />
      <span className="text-[10px] text-muted-foreground">
        {average.toFixed(1)} ({count})
      </span>
      <span className="sr-only">
        Rated {average.toFixed(1)} out of 5 from {count} reviews
      </span>
    </span>
  );
}
