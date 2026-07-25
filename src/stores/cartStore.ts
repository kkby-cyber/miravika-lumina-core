import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { itemFromProduct, trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";

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
}

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
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
            }
          } else if (existing) {
            if (!existing.lineId) return;
            const newQ = existing.quantity + item.quantity;
            const r = await updateLine(cartId, existing.lineId, newQ);
            if (r.success) {
              set({ items: get().items.map((i) => (i.variantId === item.variantId ? { ...i, quantity: newQ } : i)) });
              added = true;
            } else if (r.cartNotFound) clearCart();
          } else {
            const r = await addLine(cartId, { ...item, lineId: null });
            if (r.success) {
              set({ items: [...get().items, { ...item, lineId: r.lineId ?? null }] });
              added = true;
            } else if (r.cartNotFound) clearCart();
          }
        } catch (e) {
          console.error(e);
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
          } else if (r.cartNotFound) clearCart();
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
        } finally {
          set({ isLoading: false });
        }
      },


      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
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
      partialize: (s) => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl }),
    },
  ),
);
