export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "miravika-operating-system-ngwql.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "5ba171ad4445051bb09d7bcc3c7c1769";

import { toast } from "sonner";

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    availableForSale?: boolean;
    productType?: string;
    tags?: string[];
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    compareAtPriceRange?: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    images: {
      edges: Array<{ node: { url: string; altText: string | null } }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          compareAtPrice?: { amount: string; currencyCode: string } | null;
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
    media?: {
      edges: Array<{
        node: {
          mediaContentType: string;
          previewImage?: { url: string } | null;
          sources?: Array<{ url: string; mimeType: string }>;
          embeddedUrl?: string;
        };
      }>;
    };

  };
}

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Your store needs a paid Shopify plan. Visit admin.shopify.com to upgrade.",
    });
    return null;
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(data.errors.map((e: { message: string }) => e.message).join(", "));
  return data;
}

const PRODUCT_FIELDS = `
  id title description handle productType tags availableForSale
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  images(first: 8) { edges { node { url altText } } }
  variants(first: 20) {
    edges {
      node {
        id title
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
      media(first: 12) {
        edges {
          node {
            mediaContentType
            ... on Video {
              previewImage { url }
              sources { url mimeType }
            }
            ... on ExternalVideo {
              previewImage { url }
              embeddedUrl
            }
          }
        }
      }
    }
  }
`;



export const COLLECTION_PRODUCTS_QUERY = `
  query GetCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText }
      products(first: $first) {
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }
  }
`;

export function formatPrice(amount: string | number, currency = "INR") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  const locale = currency === "INR" ? "en-IN" : "en-US";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${n.toFixed(0)}`;
  }
}

/** Map legacy / friendly slugs → real Shopify collection handles */
export const COLLECTION_SLUG_MAP: Record<string, string> = {
  "magnetic-earrings": "jewelry-accessories",
  "fashion-accessories": "womens-fashion",
  "beauty-accessories": "beauty-personal-care",
  "hair-accessories": "womens-fashion",
  // Retired collections — permanently folded into the live seven
  "home-decor": "gifts",
  "home-kitchen": "gifts",
  home: "gifts",
  "electronics-accessories": "gifts",
  tech: "gifts",
  electronics: "gifts",
  luxury: "best-sellers",
  bags: "womens-fashion",
  scrunchies: "womens-fashion",
  bows: "womens-fashion",
  clips: "womens-fashion",
  bands: "womens-fashion",
  accessories: "jewelry-accessories",
  jewellery: "jewelry-accessories",
  rakhi: "gifts",
  women: "womens-fashion",
  fashion: "womens-fashion",
  beauty: "beauty-personal-care",
};

/** The only collections the storefront exposes. */
export const LIVE_COLLECTIONS = [
  { slug: "new-arrivals", label: "New Arrivals" },
  { slug: "trending-now", label: "Trending Now" },
  { slug: "womens-fashion", label: "Women's Fashion" },
  { slug: "jewelry-accessories", label: "Jewelry & Accessories" },
  { slug: "beauty-personal-care", label: "Beauty & Personal Care" },
  { slug: "gifts", label: "Gifts" },
  { slug: "best-sellers", label: "Best Sellers" },
] as const;

export function resolveCollectionHandle(slug: string) {
  return COLLECTION_SLUG_MAP[slug] ?? slug;
}
