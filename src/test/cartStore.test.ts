import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCartStore, type CartItem } from "../stores/cartStore";

const TOKEN = "a".repeat(32) + "b".repeat(32);

/** Minimal stand-in for the FrontendProduct shape the store persists locally. */
function makeProduct(id: string, handle: string, title: string) {
  return {
    id,
    title,
    handle,
    description: "",
    shortDescription: "",
    availableForSale: true,
    productType: "",
    tags: [],
    priceRange: { minVariantPrice: { amount: "1000", currencyCode: "INR" } },
    compareAtPrice: null,
    images: { edges: [{ node: { url: `https://cdn.test/${id}.jpg`, altText: title } }] },
    variants: {
      edges: [
        {
          node: {
            id: `variant-${id}`,
            sku: `SKU-${id}`,
            title: "Default Title",
            price: { amount: "1000", currencyCode: "INR" },
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
    sku: `SKU-${id}`,
    mrp: null,
    price: "1000",
    inventoryQuantity: 5,
  } as unknown as CartItem["product"];
}

function makeLocalItem(id: string, quantity = 1): CartItem {
  return {
    lineId: null,
    product: makeProduct(id, `handle-${id}`, `Product ${id}`),
    variantId: `variant-${id}`,
    variantTitle: "Default Title",
    price: { amount: "1000", currencyCode: "INR" },
    quantity,
    selectedOptions: [],
  };
}

/** A Nexus `cartView` line, as returned inside the `{ success, data }` envelope. */
function serverLine(options: {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  title?: string;
  slug?: string;
  price?: number;
}) {
  return {
    id: options.id,
    product_id: options.productId,
    variant_id: options.variantId ?? null,
    quantity: options.quantity,
    products: {
      title: options.title ?? `Product ${options.productId}`,
      slug: options.slug ?? `handle-${options.productId}`,
      status: "ACTIVE",
      deleted_at: null,
      price: options.price ?? 1000,
    },
    product_variants: {
      title: "Default Title",
      sku: `SKU-${options.productId}`,
      price: options.price ?? 1000,
      status: "ACTIVE",
    },
  };
}

function mockCartFetch(items: unknown[], cartId = "cart-1", cartToken: string | null = null) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: { cart: { id: cartId }, items, cart_token: cartToken },
    }),
  });
}

describe("cartStore — authoritative Nexus hydration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    useCartStore.setState({
      items: [],
      cartId: null,
      cost: null,
      isHydrated: false,
      isSyncing: false,
      isLoading: false,
    });
  });

  it("keeps a server line that has no local counterpart", async () => {
    // The customer added this on another device; dropping it would lose the item.
    vi.stubGlobal(
      "fetch",
      mockCartFetch([serverLine({ id: "line-1", productId: "p1", quantity: 2 })]),
    );

    await useCartStore.getState().syncCart();

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].product.handle).toBe("handle-p1");
    expect(items[0].quantity).toBe(2);
    expect(items[0].lineId).toBe("line-1");
  });

  it("drops a local line the server no longer has", async () => {
    useCartStore.setState({ items: [makeLocalItem("p1"), makeLocalItem("p2")] });
    vi.stubGlobal(
      "fetch",
      mockCartFetch([serverLine({ id: "line-1", productId: "p1", quantity: 1 })]),
    );

    await useCartStore.getState().syncCart();

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe("p1");
  });

  it("takes quantity and price from the server, not from local state", async () => {
    useCartStore.setState({ items: [makeLocalItem("p1", 9)] });
    vi.stubGlobal(
      "fetch",
      mockCartFetch([serverLine({ id: "line-1", productId: "p1", quantity: 3, price: 1499 })]),
    );

    await useCartStore.getState().syncCart();

    const [item] = useCartStore.getState().items;
    expect(item.quantity).toBe(3);
    expect(item.price.amount).toBe("1499");
  });

  it("preserves local presentation data (image, title) when hydrating", async () => {
    useCartStore.setState({ items: [makeLocalItem("p1", 1)] });
    vi.stubGlobal(
      "fetch",
      mockCartFetch([serverLine({ id: "line-1", productId: "p1", quantity: 1 })]),
    );

    await useCartStore.getState().syncCart();

    const [item] = useCartStore.getState().items;
    expect(item.product.images.edges[0].node.url).toBe("https://cdn.test/p1.jpg");
  });

  it("marks the cart hydrated only after a successful server response", async () => {
    vi.stubGlobal("fetch", mockCartFetch([]));
    expect(useCartStore.getState().isHydrated).toBe(false);

    await useCartStore.getState().syncCart();

    expect(useCartStore.getState().isHydrated).toBe(true);
  });

  it("stays unhydrated and keeps the bag when Nexus is unreachable", async () => {
    // Recoverable: the customer's local bag must not be destroyed, but checkout
    // must not be presented as validated.
    useCartStore.setState({ items: [makeLocalItem("p1", 2)] });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    vi.spyOn(console, "error").mockImplementation(() => {});

    await useCartStore.getState().syncCart();

    expect(useCartStore.getState().isHydrated).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("persists the server-issued cart token and echoes it on later requests", async () => {
    vi.stubGlobal("fetch", mockCartFetch([], "cart-1", TOKEN));

    await useCartStore.getState().syncCart();

    expect(window.localStorage.getItem("miravika-cart-token")).toBe(TOKEN);

    const fetchMock = mockCartFetch([]);
    vi.stubGlobal("fetch", fetchMock);
    await useCartStore.getState().syncCart();

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["x-cart-token"]).toBe(TOKEN);
  });

  it("ignores a stale sync response that resolves after a newer one", async () => {
    // Two overlapping syncs: the newer (empty) cart must win, and the older
    // (populated) response must not resurrect removed lines.
    let resolveFirst: (value: unknown) => void = () => {};
    const firstResponse = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => firstResponse)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { cart: { id: "cart-1" }, items: [] } }),
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const stale = useCartStore.getState().syncCart();
    await useCartStore.getState().syncCart();
    expect(useCartStore.getState().items).toHaveLength(0);

    resolveFirst({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          cart: { id: "cart-1" },
          items: [serverLine({ id: "line-1", productId: "p1", quantity: 1 })],
        },
      }),
    });
    await stale;

    // The stale payload is discarded — the newer authoritative state stands.
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
