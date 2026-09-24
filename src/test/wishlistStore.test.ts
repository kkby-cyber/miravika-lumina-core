import { beforeEach, describe, expect, it } from "vitest";
import { useWishlistStore } from "../stores/wishlistStore";

describe("wishlistStore — variant-aware behavior", () => {
  beforeEach(() => {
    useWishlistStore.setState({
      entries: [],
      hydrated: true,
    });
  });

  it("adds a product variant as a distinct wishlist entry", () => {
    useWishlistStore.getState().toggle("product-a", "variant-1");

    expect(useWishlistStore.getState().entries).toEqual([
      {
        handle: "product-a",
        variantId: "variant-1",
      },
    ]);
  });

  it("keeps different variants of the same product separate", () => {
    const store = useWishlistStore.getState();

    store.toggle("product-a", "variant-1");
    store.toggle("product-a", "variant-2");

    expect(useWishlistStore.getState().entries).toEqual([
      {
        handle: "product-a",
        variantId: "variant-1",
      },
      {
        handle: "product-a",
        variantId: "variant-2",
      },
    ]);

    expect(useWishlistStore.getState().entries).toHaveLength(2);
  });

  it("does not duplicate the same product variant", () => {
    const store = useWishlistStore.getState();

    store.toggle("product-a", "variant-1");
    store.toggle("product-a", "variant-1");

    expect(useWishlistStore.getState().entries).toEqual([]);
  });

  it("treats a product-level entry separately from a variant entry", () => {
    const store = useWishlistStore.getState();

    store.toggle("product-a", null);
    store.toggle("product-a", "variant-1");

    expect(useWishlistStore.getState().entries).toEqual([
      {
        handle: "product-a",
        variantId: null,
      },
      {
        handle: "product-a",
        variantId: "variant-1",
      },
    ]);
  });

  it("removes only the requested variant", () => {
    const store = useWishlistStore.getState();

    store.toggle("product-a", "variant-1");
    store.toggle("product-a", "variant-2");
    store.remove("product-a", "variant-1");

    expect(useWishlistStore.getState().entries).toEqual([
      {
        handle: "product-a",
        variantId: "variant-2",
      },
    ]);
  });

  it("has() distinguishes variants", () => {
    const store = useWishlistStore.getState();

    store.toggle("product-a", "variant-1");

    expect(store.has("product-a", "variant-1")).toBe(true);
    expect(store.has("product-a", "variant-2")).toBe(false);
    expect(store.has("product-b", "variant-1")).toBe(false);
  });

  it("toggle() adds and then removes the same variant", () => {
    const store = useWishlistStore.getState();

    store.toggle("product-a", "variant-1");

    expect(useWishlistStore.getState().entries).toEqual([
      {
        handle: "product-a",
        variantId: "variant-1",
      },
    ]);

    store.toggle("product-a", "variant-1");

    expect(useWishlistStore.getState().entries).toEqual([]);
  });

  it("keeps the second variant when toggling the first variant off", () => {
    const store = useWishlistStore.getState();

    store.toggle("product-a", "variant-1");
    store.toggle("product-a", "variant-2");
    store.toggle("product-a", "variant-1");

    expect(useWishlistStore.getState().entries).toEqual([
      {
        handle: "product-a",
        variantId: "variant-2",
      },
    ]);
  });

  it("remove() without a variant removes all entries for that product", () => {
    const store = useWishlistStore.getState();

    store.setEntries([
      {
        handle: "product-a",
        variantId: null,
      },
      {
        handle: "product-a",
        variantId: "variant-1",
      },
      {
        handle: "product-a",
        variantId: "variant-2",
      },
      {
        handle: "product-b",
        variantId: "variant-1",
      },
    ]);

    store.remove("product-a");

    expect(useWishlistStore.getState().entries).toEqual([
      {
        handle: "product-b",
        variantId: "variant-1",
      },
    ]);
  });

  it("setEntries() removes duplicate product-variant keys", () => {
    const store = useWishlistStore.getState();

    store.setEntries([
      {
        handle: "product-a",
        variantId: "variant-1",
      },
      {
        handle: "product-a",
        variantId: "variant-1",
      },
      {
        handle: "product-a",
        variantId: "variant-2",
      },
    ]);

    expect(useWishlistStore.getState().entries).toEqual([
      {
        handle: "product-a",
        variantId: "variant-1",
      },
      {
        handle: "product-a",
        variantId: "variant-2",
      },
    ]);
  });
});
