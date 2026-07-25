// Browser-safe review types shared between server functions and UI.

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  reviewerName: string;
  verifiedBuyer: boolean;
  createdAt: string;
  updatedAt: string | null;
  pictures: string[];
  videos: string[];
  helpfulVotes: number;
  productHandle: string | null;
  productTitle: string | null;
}

export interface RatingAggregate {
  average: number;
  count: number;
  /** counts per star, index 0 = 1 star */
  distribution: [number, number, number, number, number];
}

export interface ProductReviewsResult {
  configured: boolean;
  reviews: Review[];
  aggregate: RatingAggregate | null;
}

export interface ShopRatingsResult {
  configured: boolean;
  /** keyed by product handle */
  ratings: Record<string, RatingAggregate>;
  /** newest reviews with a photo, for the Customer Photos gallery / testimonials */
  featured: Review[];
}

export const EMPTY_AGGREGATE: RatingAggregate = {
  average: 0,
  count: 0,
  distribution: [0, 0, 0, 0, 0],
};

export function aggregateOf(reviews: Review[]): RatingAggregate | null {
  if (!reviews.length) return null;
  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const r of reviews) {
    const stars = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[stars - 1] += 1;
    sum += stars;
  }
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
    distribution,
  };
}
