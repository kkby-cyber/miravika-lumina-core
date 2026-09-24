const NEXUS_API_URL = import.meta.env.VITE_NEXUS_API_URL;

function getNexusApiUrl(): string {
  if (!NEXUS_API_URL) {
    throw new Error(
      "MIRAVIKA Nexus API is not configured. Set VITE_NEXUS_API_URL in the deployment environment.",
    );
  }

  return NEXUS_API_URL.replace(/\/$/, "");
}

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

async function nexusRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { supabase } = await import("@/integrations/supabase/client");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${getNexusApiUrl()}${path}`, {
    ...init,
    headers,
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

export async function getNexusProducts(
  options: {
    limit?: number;
    offset?: number;
    query?: string;
    collection?: string;
  } = {},
) {
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

export interface NexusCustomerProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface NexusCustomerOrderItem {
  title: string;
  sku: string | null;
  quantity: number;
  line_total: number | string;
}

export interface NexusCustomerOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  grand_total: number | string;
  currency: string;
  created_at: string;
  paid_at?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  order_items?: NexusCustomerOrderItem[];
}

export interface NexusAddress {
  id: string;
  user_id: string;
  address_type: "shipping" | "billing";
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getNexusCustomerProfile() {
  return nexusRequest<{ profile: NexusCustomerProfile | null }>("/api/public/customer");
}

export async function updateNexusCustomerProfile(input: {
  full_name?: string;
  phone?: string;
  marketing_opt_in?: boolean;
}) {
  return nexusRequest<{ profile: NexusCustomerProfile }>("/api/public/customer", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function getNexusCustomerOrders() {
  return nexusRequest<{ orders: NexusCustomerOrder[] }>("/api/public/customer-orders");
}

export async function getNexusCustomerAddresses() {
  return nexusRequest<{ addresses: NexusAddress[] }>("/api/public/addresses");
}

export async function createNexusCustomerAddress(input: {
  address_type?: "shipping" | "billing";
  label?: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}) {
  return nexusRequest<{ address: NexusAddress }>("/api/public/addresses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function updateNexusCustomerAddress(
  addressId: string,
  input: Partial<{
    address_type: "shipping" | "billing";
    label: string | null;
    full_name: string;
    phone: string;
    line1: string;
    line2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
  }>,
) {
  return nexusRequest<{ address: NexusAddress }>(
    `/api/public/addresses/${encodeURIComponent(addressId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export async function deleteNexusCustomerAddress(addressId: string) {
  return nexusRequest<{ ok: boolean }>(`/api/public/addresses/${encodeURIComponent(addressId)}`, {
    method: "DELETE",
  });
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
