import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FrontendProduct } from "@/lib/nexus-product";
import { itemFromProduct, trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";
import { getCartToken, setCartToken } from "@/lib/nexus-cart-token";
import { toast } from "sonner";

function cartError(message = "We couldn't update your bag. Please try again.") {
  toast.error(message, { position: "top-center" });
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface CartItem {
  lineId: string | null;
  product: FrontendProduct;
  variantId: string;
  variantTitle: string;
  price: Money;
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface NexusCartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  products?: {
    title?: string;
    slug?: string;
    status?: string;
    deleted_at?: string | null;
    price?: number | string;
  } | null;
  product_variants?: {
    title?: string;
    sku?: string;
    price?: number | string;
    status?: string;
  } | null;
}

interface NexusCartResponse {
  success: boolean;
  data?: {
    cart?: {
      id: string;
      status?: string;
    };
    items?: NexusCartItem[];
    cart_token?: string | null;
  };
  error?: {
    code?: string;
    message?: string;
  };
  cart_token?: string | null;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  /**
   * True once the authoritative Nexus cart has been fetched at least once.
   * Checkout stays disabled until then so a stale localStorage bag can never be
   * submitted before Nexus has validated it.
   */
  isHydrated: boolean;
  isOpen: boolean;
  setOpen: (o: boolean) => void;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  discountCode: string | null;
  setDiscountCode: (code: string | null) => void;
  cost: { subtotalAmount: Money; totalAmount: Money } | null;
  openCheckout: () => boolean;
}

const NEXUS_API_URL = import.meta.env.VITE_NEXUS_API_URL;

/** Monotonic request id so a slow response can never overwrite a newer one. */
let latestSyncRequest = 0;

async function nexusCartRequest(
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<NexusCartResponse> {
  const { supabase } = await import("@/integrations/supabase/client");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = getCartToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Authenticated customers are keyed by user id on Nexus; guests by cart token.
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  if (token) headers["x-cart-token"] = token;

  let response: Response;
  try {
    response = await fetch(`${NEXUS_API_URL}/api/public/cart`, {
      method,
      headers,
      body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });
  } catch {
    throw new Error("CART_UNAVAILABLE");
  }

  const data = (await response.json().catch(() => null)) as NexusCartResponse | null;

  if (!data) {
    throw new Error("CART_UNAVAILABLE");
  }

  if (!response.ok || !data.success) {
    const code = data.error?.code ?? "CART_UNAVAILABLE";
    throw new Error(code);
  }

  // Persist exactly the token Nexus issued; never mint one locally.
  if (data.data?.cart_token) setCartToken(data.data.cart_token);

  return data;
}

/**
 * Builds a displayable product for a line the server returned but that has no
 * local counterpart (another device, or a bag persisted before the sync).
 *
 * The Nexus cart projection carries only `title`, `slug`, `price` and the
 * variant's `title`/`sku`/`price` — so the line is rendered with the
 * server-authoritative price and a graceful, image-less placeholder. Returning
 * `null` here would silently drop a real item from the customer's bag.
 */
function placeholderProduct(item: NexusCartItem): FrontendProduct | null {
  const title = item.products?.title?.trim();
  const slug = item.products?.slug?.trim();

  if (!title || !slug) return null;

  const price = item.product_variants?.price ?? item.products?.price ?? 0;
  const variantId = item.variant_id ?? item.product_id;
  const sku = item.product_variants?.sku ?? item.product_id;
  const variantTitle = item.product_variants?.title ?? "Default Title";

  return {
    id: item.product_id,
    title,
    description: "",
    shortDescription: "",
    handle: slug,
    availableForSale: true,
    productType: "",
    tags: [],
    priceRange: { minVariantPrice: { amount: String(price), currencyCode: "INR" } },
    compareAtPrice: null,
    images: { edges: [] },
    variants: {
      edges: [
        {
          node: {
            id: variantId,
            sku,
            title: variantTitle,
            price: { amount: String(price), currencyCode: "INR" },
            mrp: null,
            compareAtPrice: null,
            availableForSale: true,
            selectedOptions: [],
          },
        },
      ],
    },
    options: [],
    media: { edges: [] },
    brand: "MIRAVIKA",
    sku,
    mrp: null,
    price: String(price),
    inventoryQuantity: Number(item.quantity),
  };
}

function cartItemToLocal(item: NexusCartItem, existing: CartItem | undefined): CartItem | null {
  // The server price is authoritative; only presentation data is reused locally.
  const product = existing?.product ?? placeholderProduct(item);
  if (!product) return null;

  const serverPrice = item.product_variants?.price ?? item.products?.price;
  const price =
    serverPrice != null
      ? { amount: String(serverPrice), currencyCode: existing?.price.currencyCode ?? "INR" }
      : (existing?.price ?? { amount: "0", currencyCode: "INR" });

  const variantId = item.variant_id ?? item.product_id;

  return {
    lineId: item.id,
    product,
    variantId,
    variantTitle: item.product_variants?.title ?? existing?.variantTitle ?? "Default Title",
    price,
    quantity: Math.max(1, Number(item.quantity) || 1),
    selectedOptions: existing?.selectedOptions ?? [],
  };
}

function calculateCost(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);

  const currencyCode = items[0]?.price.currencyCode ?? "INR";
  const amount = subtotal.toFixed(2);

  return {
    subtotalAmount: { amount, currencyCode },
    totalAmount: { amount, currencyCode },
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      isHydrated: false,
      isOpen: false,

      setOpen: (isOpen) => set({ isOpen }),

      addItem: async (item) => {
        set({ isLoading: true });

        try {
          const variant = item.product.variants.edges.find(
            ({ node }) => node.id === item.variantId,
          );

          const sku = variant?.node.sku || item.product.sku;

          const result = await nexusCartRequest("POST", {
            action: "add",
            sku,
            quantity: item.quantity,
          });

          const serverItems = result.data?.items ?? [];
          const serverItem = serverItems.find(
            (serverItem) =>
              serverItem.variant_id === item.variantId || serverItem.product_variants?.sku === sku,
          );

          const existing = get().items.find(
            (existingItem) => existingItem.variantId === item.variantId,
          );

          const nextItem: CartItem = {
            ...item,
            lineId: serverItem?.id ?? existing?.lineId ?? null,
            quantity:
              serverItem?.quantity ??
              (existing ? existing.quantity + item.quantity : item.quantity),
          };

          const nextItems = existing
            ? get().items.map((current) =>
                current.variantId === item.variantId ? nextItem : current,
              )
            : [...get().items, nextItem];

          set({
            items: nextItems,
            cartId: result.data?.cart?.id ?? get().cartId,
            cost: calculateCost(nextItems),
          });

          trackAddToCart(
            [
              itemFromProduct(item.product, {
                variantId: item.variantId,
                variantTitle: item.variantTitle,
                price: item.price.amount,
                quantity: item.quantity,
              }),
            ],
            item.price.currencyCode,
          );
        } catch (error) {
          console.error(error);

          const code = error instanceof Error ? error.message : "";

          if (code === "OUT_OF_STOCK") {
            cartError("Only a limited quantity is available for this item.");
          } else if (code === "PRODUCT_UNAVAILABLE") {
            cartError("This item is no longer available.");
          } else {
            cartError("This item couldn't be added right now. Please try again.");
          }
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }

        const item = get().items.find((current) => current.variantId === variantId);

        if (!item?.lineId) return;

        const previousQuantity = item.quantity;
        const delta = quantity - previousQuantity;

        set({ isLoading: true });

        try {
          const result = await nexusCartRequest("POST", {
            action: "update",
            cart_item_id: item.lineId,
            quantity,
          });

          const serverItem = (result.data?.items ?? []).find(
            (current) => current.id === item.lineId,
          );

          const actualQuantity = Number(serverItem?.quantity ?? quantity);

          const nextItems = get().items.map((current) =>
            current.variantId === variantId ? { ...current, quantity: actualQuantity } : current,
          );

          set({
            items: nextItems,
            cartId: result.data?.cart?.id ?? get().cartId,
            cost: calculateCost(nextItems),
          });

          if (delta !== 0) {
            const analyticsItem = itemFromProduct(item.product, {
              variantId,
              variantTitle: item.variantTitle,
              price: item.price.amount,
              quantity: Math.abs(delta),
            });

            if (delta > 0) {
              trackAddToCart([analyticsItem], item.price.currencyCode);
            } else {
              trackRemoveFromCart([analyticsItem], item.price.currencyCode);
            }
          }
        } catch (error) {
          console.error(error);
          cartError("Only a limited quantity is available for this item.");
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const item = get().items.find((current) => current.variantId === variantId);

        if (!item?.lineId) return;

        set({ isLoading: true });

        try {
          await nexusCartRequest("POST", {
            action: "remove",
            cart_item_id: item.lineId,
          });

          trackRemoveFromCart(
            [
              itemFromProduct(item.product, {
                variantId,
                variantTitle: item.variantTitle,
                price: item.price.amount,
                quantity: item.quantity,
              }),
            ],
            item.price.currencyCode,
          );

          const nextItems = get().items.filter((current) => current.variantId !== variantId);

          set({
            items: nextItems,
            cost: nextItems.length ? calculateCost(nextItems) : null,
          });
        } catch (error) {
          console.error(error);
          cartError("We couldn't remove that item. Please try again.");
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        // Clear Nexus first so a successful payment never leaves the
        // authoritative server cart populated while the local UI appears empty.
        await nexusCartRequest("POST", { action: "clear" });

        // Only clear local state after the authoritative Nexus cart clear succeeds.
        set({
          items: [],
          cartId: null,
          checkoutUrl: null,
          cost: null,
        });
      },

      syncCart: async () => {
        // Sequence every request; a slow earlier response must never overwrite a
        // newer authoritative snapshot (and must never resurrect removed lines).
        const requestId = ++latestSyncRequest;

        set({ isSyncing: true });

        try {
          const result = await nexusCartRequest("GET");

          if (requestId !== latestSyncRequest) return;

          const serverItems = result.data?.items ?? [];
          const localItems = get().items;

          const reconciled: CartItem[] = [];

          for (const serverItem of serverItems) {
            const existing = localItems.find(
              (localItem) =>
                localItem.lineId === serverItem.id ||
                (!!serverItem.variant_id && localItem.variantId === serverItem.variant_id) ||
                (!!serverItem.product_id && localItem.product.id === serverItem.product_id),
            );

            const mapped = cartItemToLocal(serverItem, existing);
            if (mapped) reconciled.push(mapped);
          }

          set({
            items: reconciled,
            cartId: result.data?.cart?.id ?? null,
            cost: reconciled.length ? calculateCost(reconciled) : null,
            isHydrated: true,
          });
        } catch (error) {
          if (requestId !== latestSyncRequest) return;
          // Nexus is unreachable: keep the local bag so nothing is lost, but leave
          // `isHydrated` false so checkout stays disabled until Nexus validates.
          console.error(error);
        } finally {
          if (requestId === latestSyncRequest) set({ isSyncing: false });
        }
      },

      discountCode: null,

      setDiscountCode: (code) =>
        set({
          discountCode: code ? code.trim().toUpperCase() : null,
        }),

      cost: null,

      getCheckoutUrl: () => null,

      openCheckout: () => {
        if (get().items.length === 0) {
          cartError("Your bag is empty.");
          return false;
        }

        cartError("Checkout is being prepared. Please try again shortly.");
        return false;
      },
    }),
    {
      name: "miravika-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        discountCode: state.discountCode,
      }),
    },
  ),
);
