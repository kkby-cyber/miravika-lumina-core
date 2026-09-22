export const NEXUS_API_URL =
  import.meta.env.VITE_NEXUS_API_URL || "http://localhost:8080";

export interface NexusImage {
  url: string;
  alt_text: string | null;
  position?: number;
  is_main?: boolean;
}

export interface NexusVariant {
  id: string;
  sku: string;
  title: string;
  price: number | string;
  mrp?: number | string | null;
  attributes?: Record<string, unknown> | null;
  barcode?: string | null;
}

export interface NexusInventory {
  sku?: string;
  available_quantity: number;
}

export interface NexusProduct {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  brand?: string | null;
  product_type?: string | null;
  material?: string | null;
  size?: string | null;
  color?: string | null;
  mrp?: number | string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  tax_rate?: number | string | null;
  hsn_code?: string | null;
  weight_grams?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  product_images?: NexusImage[];
  product_variants?: NexusVariant[];
  inventory?: NexusInventory[];
}

export interface NexusCollection {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  position?: number;
  seo_title?: string | null;
  seo_description?: string | null;
}

interface NexusResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code?: string;
    message?: string;
  };
}

async function nexusRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${NEXUS_API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Nexus API request failed: ${response.status}`);
  }

  const body = (await response.json()) as NexusResponse<T>;

  if (!body.success) {
    throw new Error(body.error?.message || "Nexus API request failed");
  }

  return body.data;
}

export async function getNexusProducts(options: {
  limit?: number;
  offset?: number;
  query?: string;
  collection?: string;
} = {}) {
  const params = new URLSearchParams();

  params.set("limit", String(Math.min(options.limit ?? 24, 100)));
  params.set("offset", String(Math.max(options.offset ?? 0, 0)));

  if (options.query) params.set("q", options.query);
  if (options.collection) params.set("collection", options.collection);

  return nexusRequest<{
    products: NexusProduct[];
    limit: number;
    offset: number;
  }>(`/api/public/products?${params.toString()}`);
}

export async function getNexusProduct(slug: string) {
  return nexusRequest<{
    product: NexusProduct;
  }>(`/api/public/products/${encodeURIComponent(slug)}`);
}

export async function getNexusCollections() {
  return nexusRequest<{
    collections: NexusCollection[];
  }>("/api/public/collections");
}


export interface NexusShippingQuote {
  serviceable: boolean;
  shipping_charge: number;
  currency: string;
  estimated_days?: number | null;
  etd?: string | null;
  cod_available?: boolean;
  couriers?: Array<{
    courier_name?: string;
    courier_company_id?: number | string;
    rate?: number;
    etd?: string | null;
  }>;
  source?: string;
}

export async function getNexusShippingQuote(options: {
  pincode: string;
  items: Array<{
    sku: string;
    quantity: number;
  }>;
  cod?: boolean;
}) {
  return nexusRequest<NexusShippingQuote>("/api/public/shipping/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pincode: options.pincode,
      items: options.items,
      cod: options.cod ?? false,
    }),
  });
}
