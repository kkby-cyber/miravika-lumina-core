import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProductReviews, getShopRatings, submitReview } from "@/lib/reviews.functions";
import type { ProductReviewsResult, ShopRatingsResult } from "@/lib/reviews-types";

/** Shop-wide rating map — one request per session, powers stars on product cards. */
export function useShopRatings() {
  const fn = useServerFn(getShopRatings);
  return useQuery<ShopRatingsResult>({
    queryKey: ["reviews", "shop-ratings"],
    queryFn: () => fn(),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
}

export function useProductRating(handle: string) {
  const { data } = useShopRatings();
  return data?.ratings?.[handle] ?? null;
}

export function useProductReviews(handle: string) {
  const fn = useServerFn(getProductReviews);
  return useQuery<ProductReviewsResult>({
    queryKey: ["reviews", "product", handle],
    queryFn: () => fn({ data: { handle } }),
    enabled: !!handle,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useSubmitReview() {
  const fn = useServerFn(submitReview);
  return useMutation({
    mutationFn: (input: {
      handle: string;
      productId?: string;
      name: string;
      email: string;
      rating: number;
      title: string;
      body: string;
      pictureUrls?: string[];
      videoUrls?: string[];
    }) => fn({ data: input }),
  });
}
