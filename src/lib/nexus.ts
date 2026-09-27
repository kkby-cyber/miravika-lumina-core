import { getCartToken, setCartToken } from "@/lib/nexus-cart-token";

const NEXUS_API_URL = import.meta.env.VITE_NEXUS_API_URL;

export function getNexusApiUrl(): string {
  if (!NEXUS_API_URL) {
    throw new Error(
      "MIRAVIKA Nexus API is not configured. Set VITE_NEXUS_API_URL in the deployment environment.",
    );
  }

  return NEXUS_API_URL.replace(/\/$/, "");
}

/** Narrows an unknown JSON payload to the `{ success, data, error }` envelope. */
function parseEnvelope<T>(body: unknown): NexusResponse<T> {
  if (!body || typeof body !== "object") {
    throw new NexusApiError("MALFORMED_RESPONSE", "The store could not be reached.", 0);
  }
  return body as NexusResponse<T>;
}

/**
 * Error raised by the Nexus client. `code` is the backend's stable machine code
 * (e.g. `OUT_OF_STOCK`) so callers can branch on it; `message` is always a
 * user-safe string produced by Nexus, never a raw provider or SQL error.
 */
export class NexusApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "NexusApiError";
    this.code = code;
    this.status = status;
  }
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

  // Guest carts are identified by the server-issued token, never a local one.
  const cartToken = getCartToken();
  if (cartToken) headers.set("x-cart-token", cartToken);

  let response: Response;
  try {
    response = await fetch(`${getNexusApiUrl()}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new NexusApiError(
      "NETWORK_UNAVAILABLE",
      "We could not reach MIRAVIKA. Please check your connection and try again.",
      0,
    );
  }

  const body = parseEnvelope<T>(await response.json().catch(() => null));

  if (!response.ok || !body.success) {
    throw new NexusApiError(
      body.error?.code ?? "REQUEST_FAILED",
      body.error?.message ?? "Something went wrong. Please try again.",
      response.status,
    );
  }

  return body.data;
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

export interface NexusWishlistProduct {
  id: string;
  title: string;
  slug: string;
  status: string;
  deleted_at: string | null;
}

export interface NexusWishlistItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  created_at: string;
  products?: NexusWishlistProduct | null;
}

export interface NexusWishlist {
  id: string;
  user_id: string;
}

export async function getNexusCustomerWishlist() {
  return nexusRequest<{
    wishlist: NexusWishlist;
    items: NexusWishlistItem[];
  }>("/api/public/wishlist");
}

export async function mutateNexusCustomerWishlist(input: {
  action: "add" | "remove";
  product_id: string;
  variant_id?: string | null;
}) {
  return nexusRequest<{
    wishlist: NexusWishlist;
    items: NexusWishlistItem[];
  }>("/api/public/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: input.action,
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
    }),
  });
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

/* -------------------------------------------------------------------------- */
/* Checkout & payments                                                        */
/* -------------------------------------------------------------------------- */

/** Address shape required by the Nexus checkout contract. */
export interface NexusCheckoutAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface NexusCheckoutTotals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
}

export interface NexusCheckoutResult {
  order_id: string;
  order_number: string;
  totals: NexusCheckoutTotals;
  razorpay: {
    key_id: string;
    order_id: string;
    amount: number;
    currency: string;
  };
}

/**
 * Creates the Nexus order and its Razorpay order.
 *
 * Only customer/contact details, the address, and line identifiers are sent.
 * Prices, tax, shipping, discounts and inventory are computed by Nexus from the
 * `sku`/`quantity` pairs and are never taken from the browser.
 */
export async function createNexusCheckout(input: {
  email: string;
  phone: string;
  full_name: string;
  items: Array<{ sku: string; quantity: number }>;
  shipping_address: NexusCheckoutAddress;
  billing_address?: NexusCheckoutAddress | null;
  billing_same_as_shipping: boolean;
  shipping_method_id?: string | null;
  coupon_code?: string | null;
}) {
  return nexusRequest<NexusCheckoutResult>("/api/public/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export interface NexusPaymentProof {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface NexusPaymentVerification {
  order_number: string;
  status: string;
  duplicate: boolean;
}

/**
 * Hands the Razorpay callback to Nexus, which verifies the signature server-side
 * and confirms the payment with the provider. The browser never decides that an
 * order is paid; this response is the only accepted proof.
 */
export async function verifyNexusPayment(proof: NexusPaymentProof) {
  return nexusRequest<NexusPaymentVerification>("/api/public/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proof),
  });
}
