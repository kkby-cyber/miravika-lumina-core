import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submitSchema = z.object({
  handle: z.string().trim().min(1).max(200),
  productId: z.string().trim().max(64).optional(),
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).default(""),
  body: z.string().trim().min(5, "Please write a little more").max(3000),
  pictureUrls: z.array(z.string().url()).max(6).optional(),
  videoUrls: z.array(z.string().url()).max(2).optional(),
});

export const getShopRatings = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchShopRatings } = await import("./reviews.server");
  try {
    return await fetchShopRatings();
  } catch (error) {
    console.error("[reviews] getShopRatings failed", error);
    return { configured: false, ratings: {}, featured: [] };
  }
});

export const getProductReviews = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ handle: z.string().trim().min(1).max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { fetchProductReviews } = await import("./reviews.server");
    try {
      return await fetchProductReviews(data.handle);
    } catch (error) {
      console.error("[reviews] getProductReviews failed", error);
      return { configured: false, reviews: [], aggregate: null };
    }
  });

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { submitReviewToProvider } = await import("./reviews.server");
    const result = await submitReviewToProvider(data);
    if (!result.ok && result.reason === "not_configured") {
      return { ok: false, message: "Reviews are not connected yet. Please try again shortly." };
    }
    if (!result.ok) {
      return { ok: false, message: "We couldn't save your review. Please try again." };
    }
    return {
      ok: true,
      message: "Thank you — your review is in moderation and will appear shortly.",
    };
  });
