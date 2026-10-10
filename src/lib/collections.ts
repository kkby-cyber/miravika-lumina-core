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
 * Maps any storefront slug — including retired campaign slugs still linked from old
 * pages, emails and ads — to the canonical Nexus collection slug.
 */
export function resolveCollectionHandle(slug: string) {
  return LEGACY_SLUG_REDIRECTS[slug] ?? slug;
}

/**
 * Primary navigation. Only collections seeded in Nexus are listed; the header further
 * hides any that the live API does not return, so shoppers never land on a missing edit.
 */
export const NAV_COLLECTIONS = [
  { slug: "new-arrivals", label: "New Arrivals" },
  { slug: "best-sellers", label: "Best Sellers" },
  { slug: "jewelry-accessories", label: "Earrings & Jewelry" },
  { slug: "womens-fashion", label: "Hair Accessories" },
  { slug: "beauty-personal-care", label: "Beauty" },
  { slug: "gifts", label: "Rakhi & Gifts" },
] as const;
