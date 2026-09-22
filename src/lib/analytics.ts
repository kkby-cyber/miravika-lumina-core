/**
 * GA4 / Google Ads dataLayer layer for MIRAVIKA.
 * Every event is pushed to window.dataLayer so GTM (GTM-PVNR5BST) can route it
 * to GA4 Enhanced Ecommerce, Google Ads conversions and remarketing audiences.
 */
import type { FrontendProduct } from "@/lib/nexus-product";
import { pixelEvent } from "@/lib/pixels";

type DL = Record<string, unknown>;

export function pushDL(payload: DL) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: DL[] };
  w.dataLayer = w.dataLayer || [];
  // Clear the previous ecommerce object so values never bleed between events.
  if ("ecommerce" in payload) w.dataLayer.push({ ecommerce: null });
  w.dataLayer.push(payload);
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity?: number;
  index?: number;
}

const numericId = (gid: string) => gid.split("/").pop() ?? gid;

export function itemFromProduct(
  p: FrontendProduct,
  opts: {
    variantId?: string;
    variantTitle?: string;
    price?: string | number;
    quantity?: number;
    index?: number;
  } = {},
): GA4Item {
  return {
    item_id: opts.variantId ? numericId(opts.variantId) : numericId(p.id),
    item_name: p.title,
    item_brand: "MIRAVIKA",
    item_category: p.productType || undefined,
    item_variant:
      opts.variantTitle && opts.variantTitle !== "Default Title" ? opts.variantTitle : undefined,
    price: Number(opts.price ?? p.priceRange.minVariantPrice.amount),
    quantity: opts.quantity ?? 1,
    index: opts.index,
  };
}

const value = (items: GA4Item[]) => items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0);
const contentIds = (items: GA4Item[]) => items.map((i) => i.item_id);

export const trackPageView = (path: string, title: string) =>
  pushDL({
    event: "page_view",
    page_path: path,
    page_title: title,
    page_location: typeof window !== "undefined" ? window.location.href : path,
  });

export const trackViewItem = (items: GA4Item[], currency: string) => {
  pushDL({ event: "view_item", ecommerce: { currency, value: value(items), items } });
  pixelEvent("ViewContent", {
    content_ids: contentIds(items),
    content_type: "product",
    currency,
    value: value(items),
  });
};

export const trackViewItemList = (items: GA4Item[], listId: string, listName: string) =>
  pushDL({
    event: "view_item_list",
    ecommerce: { item_list_id: listId, item_list_name: listName, items },
  });

export const trackSelectItem = (item: GA4Item, listId: string, listName: string) =>
  pushDL({
    event: "select_item",
    ecommerce: { item_list_id: listId, item_list_name: listName, items: [item] },
  });

export const trackAddToCart = (items: GA4Item[], currency: string) => {
  pushDL({ event: "add_to_cart", ecommerce: { currency, value: value(items), items } });
  pixelEvent("AddToCart", {
    content_ids: contentIds(items),
    content_type: "product",
    currency,
    value: value(items),
  });
};

export const trackRemoveFromCart = (items: GA4Item[], currency: string) =>
  pushDL({ event: "remove_from_cart", ecommerce: { currency, value: value(items), items } });

export const trackViewCart = (items: GA4Item[], currency: string) =>
  pushDL({ event: "view_cart", ecommerce: { currency, value: value(items), items } });

export const trackBeginCheckout = (items: GA4Item[], currency: string) => {
  pushDL({ event: "begin_checkout", ecommerce: { currency, value: value(items), items } });
  pixelEvent("InitiateCheckout", {
    content_ids: contentIds(items),
    content_type: "product",
    currency,
    value: value(items),
  });
};

/**
 * Purchase / conversion event — the ONLY place a purchase may be reported.
 *
 * Shopify hosts checkout and owns the order, so this is called from exactly two
 * genuine post-order surfaces:
 *   1. the Shopify Customer Events "Custom Pixel" (checkout_completed), which
 *      pushes the same payload into GTM-PVNR5BST on Shopify's own thank-you page;
 *   2. /thank-you, as a fallback when Shopify returns the shopper here with
 *      order parameters.
 * Both paths key off the real Shopify order id, and the de-duplication guard
 * below is persistent, so a refresh, a re-visit or both surfaces firing can
 * never produce a second conversion.
 */
export function trackPurchase(order: {
  transaction_id: string;
  value: number;
  currency: string;
  shipping?: number;
  tax?: number;
  coupon?: string;
  items?: GA4Item[];
}) {
  // Only a real, Shopify-confirmed order with a positive amount may convert.
  if (typeof window === "undefined" || !order.transaction_id) return;
  if (!Number.isFinite(order.value) || order.value <= 0) return;
  const key = `miravika_purchase_${order.transaction_id}`;
  try {
    // localStorage (not sessionStorage): survives refreshes and new sessions.
    if (window.localStorage.getItem(key)) return; // never double-count
    window.localStorage.setItem(key, String(Date.now()));
  } catch {
    /* private mode — still send once per page load */
  }
  pushDL({
    event: "purchase",
    ecommerce: {
      transaction_id: order.transaction_id,
      value: order.value,
      currency: order.currency,
      shipping: order.shipping ?? 0,
      tax: order.tax ?? 0,
      coupon: order.coupon,
      items: order.items ?? [],
    },
  });
  pixelEvent(
    "Purchase",
    {
      value: order.value,
      currency: order.currency,
      content_type: "product",
      contents: (order.items ?? []).map((i) => ({
        id: i.item_id,
        quantity: i.quantity ?? 1,
        item_price: i.price,
      })),
      content_ids: (order.items ?? []).map((i) => i.item_id),
      order_id: order.transaction_id,
    },
    order.transaction_id,
  );
}

export const trackSearch = (term: string, results: number) => {
  pushDL({ event: "search", search_term: term, search_results: results });
  pixelEvent("Search", { search_string: term });
};

export const trackAddToWishlist = (items: GA4Item[], currency: string) => {
  pushDL({ event: "add_to_wishlist", ecommerce: { currency, value: value(items), items } });
  pixelEvent("AddToWishlist", { content_ids: contentIds(items), currency, value: value(items) });
};

export const trackRemoveFromWishlist = (items: GA4Item[], currency: string) =>
  pushDL({ event: "remove_from_wishlist", ecommerce: { currency, value: value(items), items } });

export const trackGenerateLead = (method: string, params: Record<string, unknown> = {}) => {
  pushDL({ event: "generate_lead", lead_method: method, ...params });
  pixelEvent("Lead", { content_name: method });
};

export const trackContact = (method: string) =>
  pushDL({ event: "contact", contact_method: method });

export const trackLogin = (method: string) => pushDL({ event: "login", method });

export const trackSignUp = (method: string) => {
  pushDL({ event: "sign_up", method });
  pixelEvent("CompleteRegistration", { content_name: method });
};
