import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { itemFromProduct, trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";
import { toast } from "sonner";

/** Customer-friendly failure notice — never surfaces raw API/stack detail. */
function cartError(message = "We couldn't update your bag. Please try again.") {
  toast.error(message, { position: "top-center" });
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
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
  /** Authoritative amounts as calculated by Shopify (never computed locally). */
  cost: { subtotalAmount: Money; totalAmount: Money } | null;
  /** Opens Shopify's hosted checkout; falls back to same-tab when popups are blocked. */
  openCheckout: () => boolean;
}

const CART_QUERY = `query cart($id: ID!) {
  cart(id: $id) {
    id
    totalQuantity
    checkoutUrl
    cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise { ... on ProductVariant { id availableForSale } }
        }
      }
    }
  }
}`;
const CART_CREATE = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl lines(first:100){edges{node{id merchandise{... on ProductVariant{id}}}}} } userErrors { field message } } }`;
const CART_ADD = `mutation cartLinesAdd($cartId: ID!, $lines:[CartLineInput!]!) { cartLinesAdd(cartId:$cartId, lines:$lines) { cart { id lines(first:100){edges{node{id merchandise{... on ProductVariant{id}}}}} } userErrors{field message} } }`;
const CART_UPDATE = `mutation cartLinesUpdate($cartId: ID!, $lines:[CartLineUpdateInput!]!) { cartLinesUpdate(cartId:$cartId, lines:$lines) { cart{id} userErrors{field message} } }`;
const CART_REMOVE = `mutation cartLinesRemove($cartId: ID!, $lineIds:[ID!]!) { cartLinesRemove(cartId:$cartId, lineIds:$lineIds) { cart{id} userErrors{field message} } }`;

function formatCheckoutUrl(url: string) {
  try {
    const u = new URL(url);
    u.searchParams.set("channel", "online_store");
    return u.toString();
  } catch {
    return url;
  }
}

type UserErr = { field: string[] | null; message: string };
const cartNotFound = (errs: UserErr[]) =>
  errs.some((e) => /cart not found|does not exist/i.test(e.message));

async function createShopifyCart(item: CartItem) {
  const data = await storefrontApiRequest(CART_CREATE, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });
  const errs = data?.data?.cartCreate?.userErrors ?? [];
  if (errs.length) return null;
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  return { cartId: cart.id as string, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

async function addLine(cartId: string, item: CartItem) {
  const data = await storefrontApiRequest(CART_ADD, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });
  const errs: UserErr[] = data?.data?.cartLinesAdd?.userErrors ?? [];
  if (cartNotFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) return { success: false };
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges ?? [];
  const newLine = lines.find((l: { node: { merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id as string | undefined };
}

async function updateLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_UPDATE, { cartId, lines: [{ id: lineId, quantity }] });
  const errs: UserErr[] = data?.data?.cartLinesUpdate?.userErrors ?? [];
  if (cartNotFound(errs)) return { success: false, cartNotFound: true };
  return { success: !errs.length };
}

async function removeLine(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_REMOVE, { cartId, lineIds: [lineId] });
  const errs: UserErr[] = data?.data?.cartLinesRemove?.userErrors ?? [];
  if (cartNotFound(errs)) return { success: false, cartNotFound: true };
  return { success: !errs.length };
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
        const { items, cartId, clearCart } = get();
        const existing = items.find((i) => i.variantId === item.variantId);
        set({ isLoading: true });
        let added = false;
        try {
          if (!cartId) {
            const r = await createShopifyCart({ ...item, lineId: null });
            if (r) {
              set({ cartId: r.cartId, checkoutUrl: r.checkoutUrl, items: [{ ...item, lineId: r.lineId ?? null }] });
              added = true;
            } else {
              cartError("This item couldn't be added right now. Please try again.");
            }
          } else if (existing) {
            if (!existing.lineId) return;
            const newQ = existing.quantity + item.quantity;
            const r = await updateLine(cartId, existing.lineId, newQ);
            if (r.success) {
              set({ items: get().items.map((i) => (i.variantId === item.variantId ? { ...i, quantity: newQ } : i)) });
              added = true;
            } else if (r.cartNotFound) {
              clearCart();
              cartError("Your bag expired. Please add the item again.");
            } else {
              cartError("We couldn't update the quantity. It may be out of stock.");
            }
          } else {
            const r = await addLine(cartId, { ...item, lineId: null });
            if (r.success) {
              set({ items: [...get().items, { ...item, lineId: r.lineId ?? null }] });
              added = true;
            } else if (r.cartNotFound) {
              clearCart();
              cartError("Your bag expired. Please add the item again.");
            } else {
              cartError("This item couldn't be added right now. Please try again.");
            }
          }
        } catch (e) {
          console.error(e);
          cartError("Network issue — please check your connection and try again.");
        } finally {
          set({ isLoading: false });
        }
        if (added) {
          trackAddToCart(
            [itemFromProduct(item.product.node, { variantId: item.variantId, variantTitle: item.variantTitle, price: item.price.amount, quantity: item.quantity })],
            item.price.currencyCode,
          );
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        const delta = quantity - item.quantity;
        set({ isLoading: true });
        try {
          const r = await updateLine(cartId, item.lineId, quantity);
          if (r.success) {
            set({ items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
            if (delta !== 0) {
              const ga = [itemFromProduct(item.product.node, { variantId, variantTitle: item.variantTitle, price: item.price.amount, quantity: Math.abs(delta) })];
              delta > 0 ? trackAddToCart(ga, item.price.currencyCode) : trackRemoveFromCart(ga, item.price.currencyCode);
            }
          } else if (r.cartNotFound) {
            clearCart();
            cartError("Your bag expired. Please add the item again.");
          } else {
            cartError("Only a limited quantity is available for this item.");
          }
        } catch (e) {
          console.error(e);
          cartError("Network issue — please check your connection and try again.");
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const r = await removeLine(cartId, item.lineId);
          if (r.success) {
            trackRemoveFromCart(
              [itemFromProduct(item.product.node, { variantId, variantTitle: item.variantTitle, price: item.price.amount, quantity: item.quantity })],
              item.price.currencyCode,
            );
            const next = get().items.filter((i) => i.variantId !== variantId);
            next.length === 0 ? clearCart() : set({ items: next });
          } else if (r.cartNotFound) clearCart();
          else cartError("We couldn't remove that item. Please try again.");
        } catch (e) {
          console.error(e);
          cartError("Network issue — please check your connection and try again.");
        } finally {
          set({ isLoading: false });
        }
      },


      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null, cost: null }),

      discountCode: null,
      setDiscountCode: (code) => set({ discountCode: code ? code.trim().toUpperCase() : null }),

      cost: null,

      // Shopify applies the code on its hosted checkout via the discount param
      getCheckoutUrl: () => {
        const { checkoutUrl, discountCode } = get();
        if (!checkoutUrl) return null;
        if (!discountCode) return checkoutUrl;
        const sep = checkoutUrl.includes("?") ? "&" : "?";
        return `${checkoutUrl}${sep}discount=${encodeURIComponent(discountCode)}`;
      },

      /**
       * Hands the shopper to Shopify's hosted checkout (where Razorpay and every
       * other configured Shopify payment method lives). The cart is never cleared
       * here — only a Shopify-confirmed empty cart clears it, in syncCart.
       */
      openCheckout: () => {
        const url = get().getCheckoutUrl();
        if (!url || get().items.length === 0) {
          cartError("Checkout isn't available right now. Please refresh and try again.");
          return false;
        }
        const win = typeof window !== "undefined" ? window.open(url, "_blank", "noopener") : null;
        if (!win && typeof window !== "undefined") window.location.href = url; // popup blocked
        return true;
      },

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return; // API/billing error — keep the local bag intact
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) {
            clearCart();
            return;
          }
          // Shopify is authoritative: reconcile quantities, drop lines it dropped,
          // and store Shopify's own cost so we never invent a payable amount.
          type Line = { node: { id: string; quantity: number; merchandise: { id: string } } };
          const lines: Line[] = cart.lines?.edges ?? [];
          const byVariant = new Map(lines.map((l) => [l.node.merchandise.id, l.node]));
          const reconciled = get()
            .items.filter((i) => byVariant.has(i.variantId))
            .map((i) => {
              const l = byVariant.get(i.variantId)!;
              return { ...i, lineId: l.id, quantity: l.quantity };
            });
          set({
            items: reconciled,
            checkoutUrl: cart.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : get().checkoutUrl,
            cost: cart.cost ?? null,
          });
        } catch (e) {
          console.error(e);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "miravika-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl, discountCode: s.discountCode }),
    },
  ),
);
