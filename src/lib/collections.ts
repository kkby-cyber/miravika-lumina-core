/**
 * Canonical MIRAVIKA collection routes.
 * Data is served by MIRAVIKA Nexus, not Shopify.
 */

export const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  "signature-collection": "best-sellers",
  luxury: "best-sellers",

  "ready-to-wear": "womens-fashion",
  women: "womens-fashion",
  fashion: "womens-fashion",
  bags: "womens-fashion",
  scrunchies: "womens-fashion",
  bows: "womens-fashion",
  clips: "womens-fashion",
  bands: "womens-fashion",
  "hair-accessories": "womens-fashion",
  "fashion-accessories": "womens-fashion",

  "accessories-fine-goods": "jewelry-accessories",
  jewellery: "jewelry-accessories",
  accessories: "jewelry-accessories",
  "magnetic-earrings": "jewelry-accessories",

  "beauty-personal-care": "beauty-personal-care",
  beauty: "beauty-personal-care",
  "beauty-accessories": "beauty-personal-care",

  "curated-sets": "gifts",
  rakhi: "gifts",
  "home-decor": "home-kitchen",
  "home-kitchen": "home-kitchen",
  home: "home-kitchen",

  tech: "electronics-accessories",
  electronics: "electronics-accessories",
};

export const LIVE_COLLECTIONS = [
  { slug: "new-arrivals", label: "New Arrivals" },
  { slug: "trending-now", label: "Trending Now" },
  { slug: "womens-fashion", label: "Women's Fashion" },
  { slug: "jewelry-accessories", label: "Jewelry & Accessories" },
  { slug: "beauty-personal-care", label: "Beauty & Personal Care" },
  { slug: "home-kitchen", label: "Home & Kitchen" },
  { slug: "electronics-accessories", label: "Electronics & Accessories" },
  { slug: "gifts", label: "Gifts" },
  { slug: "best-sellers", label: "Best Sellers" },
] as const;

/**
 * Nexus uses the actual collection slug directly.
 * Kept as a neutral helper so routes don't depend on a commerce platform.
 */
export function resolveCollectionHandle(slug: string) {
  return slug;
}
