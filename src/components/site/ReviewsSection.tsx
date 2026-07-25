import { useMemo, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Pencil, ThumbsUp, X } from "lucide-react";
import { Stars } from "./Stars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useProductReviews, useSubmitReview } from "@/hooks/useReviews";
import type { Review } from "@/lib/reviews-types";

type SortKey = "helpful" | "newest" | "highest";

const SORTS: [SortKey, string][] = [
  ["helpful", "Most Helpful"],
  ["newest", "Newest"],
  ["highest", "Highest Rating"],
];

function formatDate(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="border-b border-border/50 py-6 last:border-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars rating={review.rating} />
        {review.verifiedBuyer && (
          <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-gold">
            <CheckCircle2 className="h-3 w-3" /> Verified Buyer
          </span>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">{formatDate(review.createdAt)}</span>
      </div>
      {review.title && <h4 className="mt-3 font-display text-lg leading-snug">{review.title}</h4>}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{review.body}</p>

      {(review.pictures.length > 0 || review.videos.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.pictures.map((src) => (
            <img
              key={src}
              src={src}
              alt={`Customer photo from ${review.reviewerName}`}
              loading="lazy"
              className="h-20 w-20 rounded-md object-cover"
            />
          ))}
          {review.videos.map((src) => (
            <video key={src} src={src} controls preload="none" className="h-20 w-32 rounded-md bg-beige object-cover" />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>{review.reviewerName}</span>
        {review.helpfulVotes > 0 && (
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="h-3 w-3 text-gold" /> {review.helpfulVotes} found this helpful
          </span>
        )}
        {review.updatedAt && review.updatedAt !== review.createdAt && (
          <span className="inline-flex items-center gap-1">
            <Pencil className="h-3 w-3" /> Updated
          </span>
        )}
      </div>
    </article>
  );
}

function ReviewForm({
  handle,
  productId,
  onDone,
}: {
  handle: string;
  productId?: string;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [media, setMedia] = useState("");
  const { mutateAsync, isPending } = useSubmitReview();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = media
      .split(/[\s,]+/)
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u));
    const pictureUrls = urls.filter((u) => !/\.(mp4|mov|webm)(\?|$)/i.test(u)).slice(0, 6);
    const videoUrls = urls.filter((u) => /\.(mp4|mov|webm)(\?|$)/i.test(u)).slice(0, 2);

    try {
      const res = await mutateAsync({ handle, productId, name, email, rating, title, body, pictureUrls, videoUrls });
      if (res.ok) {
        toast.success(res.message, { position: "top-center" });
        onDone();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("We couldn't save your review. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-lg border border-border/60 bg-beige/30 p-5">
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Write a review</p>
      <div className="mt-3 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            <Stars rating={rating >= i ? 5 : 0} size={20} className={i === 1 ? "" : "hidden"} />
            <span className={i === 1 ? "hidden" : ""}>
              <Stars rating={rating >= i ? 5 : 0} size={20} />
            </span>
          </button>
        ))}
        <span className="ml-1 text-xs text-muted-foreground">{rating} / 5</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-ivory" />
        <Input
          required
          type="email"
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email used for your order"
          className="bg-ivory"
        />
      </div>
      <Input
        maxLength={120}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Headline (optional)"
        className="mt-3 bg-ivory"
      />
      <Textarea
        required
        maxLength={3000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How did the piece look, feel and wear?"
        rows={4}
        className="mt-3 bg-ivory"
      />
      <label className="mt-3 block">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <ImagePlus className="h-3.5 w-3.5 text-gold" /> Photo or video links (optional)
        </span>
        <Input
          value={media}
          onChange={(e) => setMedia(e.target.value)}
          placeholder="https://… (separate multiple links with a space)"
          className="mt-1.5 bg-ivory"
        />
      </label>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Reviews are matched to your order email — verified purchases receive a Verified Buyer badge. You can update your
        review later from the link in your review confirmation email.
      </p>
      <div className="mt-4 flex gap-2">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-full bg-foreground px-8 text-[11px] uppercase tracking-[0.22em] text-ivory hover:bg-foreground/90"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} className="h-11 rounded-full text-[11px] uppercase tracking-[0.22em]">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ReviewsSection({
  handle,
  productId,
  productTitle,
}: {
  handle: string;
  productId?: string;
  productTitle: string;
}) {
  const { data, isLoading } = useProductReviews(handle);
  const [sort, setSort] = useState<SortKey>("helpful");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);

  const reviews = data?.reviews ?? [];
  const aggregate = data?.aggregate ?? null;

  const visible = useMemo(() => {
    let arr = [...reviews];
    if (starFilter) arr = arr.filter((r) => Math.round(r.rating) === starFilter);
    if (sort === "newest") arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (sort === "highest") arr.sort((a, b) => b.rating - a.rating || (a.createdAt < b.createdAt ? 1 : -1));
    if (sort === "helpful") arr.sort((a, b) => b.helpfulVotes - a.helpfulVotes || (a.createdAt < b.createdAt ? 1 : -1));
    return arr;
  }, [reviews, sort, starFilter]);

  const photos = useMemo(() => reviews.flatMap((r) => r.pictures.map((p) => ({ src: p, name: r.reviewerName }))), [reviews]);

  return (
    <section id="reviews" className="mt-20 border-t border-border/50 pt-14">
      <div className="mb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Client Reviews</p>
        <h2 className="mt-2 font-display text-2xl md:text-3xl">What Our Clients Say</h2>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-8 rounded-lg border border-border/60 bg-beige/30 p-6 md:grid-cols-[240px_1fr] md:p-8">
        <div className="text-center md:text-left">
          {aggregate ? (
            <>
              <p className="font-display text-5xl leading-none">{aggregate.average.toFixed(1)}</p>
              <div className="mt-2 flex justify-center md:justify-start">
                <Stars rating={aggregate.average} size={18} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Based on {aggregate.count} verified {aggregate.count === 1 ? "review" : "reviews"}
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-3xl leading-tight">No reviews yet</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Be the first to review {productTitle}.
              </p>
            </>
          )}
          {!writing && (
            <Button
              onClick={() => setWriting(true)}
              variant="outline"
              className="mt-5 h-11 w-full rounded-full border-foreground/30 text-[11px] uppercase tracking-[0.22em] hover:border-gold hover:text-gold"
            >
              Write a Review
            </Button>
          )}
        </div>

        <div>
          {aggregate ? (
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = aggregate.distribution[star - 1];
                const pct = aggregate.count ? (count / aggregate.count) * 100 : 0;
                const active = starFilter === star;
                return (
                  <button
                    key={star}
                    onClick={() => setStarFilter(active ? null : star)}
                    className="flex w-full items-center gap-3 text-left"
                    aria-pressed={active}
                  >
                    <span className={`w-9 text-[11px] ${active ? "text-gold" : "text-muted-foreground"}`}>{star} ★</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ivory">
                      <span className="block h-full bg-gold/80" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-8 text-right text-[11px] text-muted-foreground">{count}</span>
                  </button>
                );
              })}
              {starFilter && (
                <button
                  onClick={() => setStarFilter(null)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-gold"
                >
                  <X className="h-3 w-3" /> Clear filter
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Every review on MIRAVIKA comes from a real order. Once your piece arrives, we'll invite you to share your
              experience — with photos or video if you like.
            </p>
          )}
        </div>
      </div>

      {writing && <ReviewForm handle={handle} productId={productId} onDone={() => setWriting(false)} />}

      {/* CUSTOMER PHOTOS */}
      {photos.length > 0 && (
        <div className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Customer Photos</p>
          <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-6">
            {photos.slice(0, 12).map((p) => (
              <img
                key={p.src}
                src={p.src}
                alt={`MIRAVIKA customer photo shared by ${p.name}`}
                loading="lazy"
                className="aspect-square w-full rounded-md object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* LIST + FILTERS */}
      {reviews.length > 0 && (
        <>
          <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-border/50 pb-4">
            {SORTS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition ${
                  sort === key ? "border-foreground bg-foreground text-ivory" : "border-border hover:border-foreground"
                }`}
              >
                {label}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-muted-foreground">{visible.length} shown</span>
          </div>
          <div>
            {visible.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </>
      )}

      {isLoading && <p className="mt-8 text-center text-sm text-muted-foreground">Loading reviews…</p>}
    </section>
  );
}
