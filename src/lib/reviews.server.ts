// Server-only Judge.me (Shopify review app) client.
// Reads credentials from the server environment at call time — never at module scope.
import { aggregateOf, type Review, type ProductReviewsResult, type ShopRatingsResult } from "./reviews-types";

const API_BASE = "https://judge.me/api/v1";

function credentials() {
  const apiToken = process.env.JUDGEME_API_TOKEN;
  const shopDomain =
    process.env.JUDGEME_SHOP_DOMAIN || "miravika-operating-system-ngwql.myshopify.com";
  if (!apiToken) return null;
  return { apiToken, shopDomain };
}

export function isConfigured() {
  return !!credentials();
}

type RawReview = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function mediaUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        const o = entry as Record<string, unknown>;
        return str(o.urls ? (o.urls as Record<string, unknown>).original : undefined) || str(o.url) || str(o.original);
      }
      return "";
    })
    .filter(Boolean);
}

function normalize(raw: RawReview): Review {
  const verifiedRaw = raw.verified;
  const verifiedBuyer =
    verifiedRaw === true ||
    (typeof verifiedRaw === "string" && /buyer|verified/i.test(verifiedRaw));
  const product = (raw.product ?? {}) as Record<string, unknown>;
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    rating: Number(raw.rating ?? 0),
    title: str(raw.title),
    body: str(raw.body),
    reviewerName: str((raw.reviewer as Record<string, unknown>)?.name) || str(raw.name) || "Verified customer",
    verifiedBuyer,
    createdAt: str(raw.created_at),
    updatedAt: str(raw.updated_at) || null,
    pictures: mediaUrls(raw.pictures),
    videos: mediaUrls(raw.videos),
    helpfulVotes: Number(raw.votes_up ?? raw.helpful_votes ?? 0),
    productHandle: str(raw.product_handle) || str(product.handle) || null,
    productTitle: str(raw.product_title) || str(product.title) || null,
  };
}

async function judgemeGet(path: string, params: Record<string, string | number>) {
  const creds = credentials();
  if (!creds) return null;
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("api_token", creds.apiToken);
  url.searchParams.set("shop_domain", creds.shopDomain);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[judge.me] GET ${path} failed [${res.status}]: ${text}`);
    throw new Error(`Review provider request failed [${res.status}]: ${text}`);
  }
  return (await res.json()) as Record<string, unknown>;
}

export async function fetchProductReviews(handle: string): Promise<ProductReviewsResult> {
  if (!isConfigured()) return { configured: false, reviews: [], aggregate: null };
  const json = await judgemeGet("/reviews", { handle, per_page: 100, published: "true" });
  const raw = Array.isArray(json?.reviews) ? (json!.reviews as RawReview[]) : [];
  const reviews = raw.map(normalize).filter((r) => r.rating > 0);
  return { configured: true, reviews, aggregate: aggregateOf(reviews) };
}

/** One shop-wide pass used to render star ratings on product cards and collection grids. */
export async function fetchShopRatings(): Promise<ShopRatingsResult> {
  if (!isConfigured()) return { configured: false, ratings: {}, featured: [] };

  const all: Review[] = [];
  for (let page = 1; page <= 5; page += 1) {
    const json = await judgemeGet("/reviews", { per_page: 100, page, published: "true" });
    const raw = Array.isArray(json?.reviews) ? (json!.reviews as RawReview[]) : [];
    all.push(...raw.map(normalize));
    if (raw.length < 100) break;
  }

  const byHandle = new Map<string, Review[]>();
  for (const r of all) {
    if (!r.productHandle || r.rating <= 0) continue;
    const list = byHandle.get(r.productHandle) ?? [];
    list.push(r);
    byHandle.set(r.productHandle, list);
  }

  const ratings: ShopRatingsResult["ratings"] = {};
  for (const [handle, list] of byHandle) {
    const agg = aggregateOf(list);
    if (agg) ratings[handle] = agg;
  }

  const featured = all
    .filter((r) => r.rating >= 4 && (r.pictures.length > 0 || r.body.trim().length > 60))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 12);

  return { configured: true, ratings, featured };
}

export interface SubmitReviewInput {
  handle: string;
  productId?: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  body: string;
  pictureUrls?: string[];
  videoUrls?: string[];
}

export async function submitReviewToProvider(input: SubmitReviewInput) {
  const creds = credentials();
  if (!creds) return { ok: false as const, reason: "not_configured" as const };

  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      shop_domain: creds.shopDomain,
      platform: "shopify",
      name: input.name,
      email: input.email,
      rating: input.rating,
      title: input.title,
      body: input.body,
      url: `https://miravika.com/product/${input.handle}`,
      product_handle: input.handle,
      ...(input.productId ? { id: input.productId } : {}),
      ...(input.pictureUrls?.length ? { picture_urls: input.pictureUrls } : {}),
      ...(input.videoUrls?.length ? { video_urls: input.videoUrls } : {}),
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`[judge.me] POST /reviews failed [${res.status}]: ${text}`);
    return { ok: false as const, reason: "provider_error" as const, status: res.status, body: text };
  }
  return { ok: true as const };
}
