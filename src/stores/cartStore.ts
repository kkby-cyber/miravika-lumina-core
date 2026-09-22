import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FrontendProduct } from "@/lib/nexus-product";
import { itemFromProduct, trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";
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
  isOpen: boolean;
  setOpen: (o: boolean) => void;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  discountCode: string | null;
  setDiscountCode: (code: string | null) => void;
  cost: { subtotalAmount: Money; totalAmount: Money } | null;
  openCheckout: () => boolean;
}

const NEXUS_API_URL =
  import.meta.env.VITE_NEXUS_API_URL || "http://localhost:8080";

function getCartToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("miravika-cart-token");
}

function setCartToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("miravika-cart-token", token);
  else localStorage.removeItem("miravika-cart-token");
}

async function nexusCartRequest(
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<NexusCartResponse> {
  const token = getCartToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers["x-cart-token"] = token;

  const response = await fetch(`${NEXUS_API_URL}/api/public/cart`, {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    credentials: "include",
  });

  const data = (await response.json()) as NexusCartResponse;

  if (!response.ok || !data.success) {
    const code = data.error?.code ?? "CART_UNAVAILABLE";
    throw new Error(code);
  }

  if (data.cart_token) setCartToken(data.cart_token);

  return data;
}

function cartItemToLocal(
  item: NexusCartItem,
  existing: CartItem | undefined,
): CartItem | null {
  if (!existing) return null;

  return {
    ...existing,
    lineId: item.id,
    quantity: Number(item.quantity),
  };
}

function calculateCost(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price.amount) * item.quantity,
    0,
  );

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
              serverItem.variant_id === item.variantId ||
              serverItem.product_variants?.sku === sku,
          );

          const existing = get().items.find(
            (existingItem) => existingItem.variantId === item.variantId,
          );

          const nextItem: CartItem = {
            ...item,
            lineId: serverItem?.id ?? existing?.lineId ?? null,
            quantity: serverItem?.quantity ?? (
              existing
                ? existing.quantity + item.quantity
                : item.quantity
            ),
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

        const item = get().items.find(
          (current) => current.variantId === variantId,
        );

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
            current.variantId === variantId
              ? { ...current, quantity: actualQuantity }
              : current,
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

            delta > 0
              ? trackAddToCart([analyticsItem], item.price.currencyCode)
              : trackRemoveFromCart([analyticsItem], item.price.currencyCode);
          }
        } catch (error) {
          console.error(error);
          cartError("Only a limited quantity is available for this item.");
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const item = get().items.find(
          (current) => current.variantId === variantId,
        );

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

          const nextItems = get().items.filter(
            (current) => current.variantId !== variantId,
          );

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

      clearCart: () => {
        set({
          items: [],
          cartId: null,
          checkoutUrl: null,
          cost: null,
        });

        void nexusCartRequest("POST", { action: "clear" }).catch((error) =>
          console.error(error),
        );
      },

      syncCart: async () => {
        const { isSyncing } = get();
        if (isSyncing) return;

        set({ isSyncing: true });

        try {
          const result = await nexusCartRequest("GET");
          const serverItems = result.data?.items ?? [];
          const localItems = get().items;

          const reconciled: CartItem[] = [];

          for (const serverItem of serverItems) {
            const existing = localItems.find(
              (localItem) =>
                localItem.lineId === serverItem.id ||
                localItem.variantId === serverItem.variant_id,
            );

            const mapped = cartItemToLocal(serverItem, existing);
            if (mapped) reconciled.push(mapped);
          }

          set({
            items: reconciled,
            cartId: result.data?.cart?.id ?? null,
            cost: reconciled.length ? calculateCost(reconciled) : null,
          });
        } catch (error) {
          console.error(error);
        } finally {
          set({ isSyncing: false });
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
