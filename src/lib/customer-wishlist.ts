import {
  getNexusCustomerWishlist,
  getNexusProduct,
  mutateNexusCustomerWishlist,
  type NexusWishlistItem,
} from "@/lib/nexus";
import { toFrontendProduct, type FrontendProduct } from "@/lib/nexus-product";
import { useWishlistStore } from "@/stores/wishlistStore";

export type CustomerWishlistState = {
  authenticated: boolean;
  items: NexusWishlistItem[];
};

export async function loadCustomerWishlist(): Promise<CustomerWishlistState> {
  const data = await getNexusCustomerWishlist();

  return {
    authenticated: true,
    items: data.items ?? [],
  };
}

export async function addCustomerWishlistItem(
  product: FrontendProduct,
  variantId: string | null = null,
) {
  return mutateNexusCustomerWishlist({
    action: "add",
    product_id: product.id,
    variant_id: variantId,
  });
}

export async function removeCustomerWishlistItem(
  productId: string,
  variantId: string | null = null,
) {
  return mutateNexusCustomerWishlist({
    action: "remove",
    product_id: productId,
    variant_id: variantId,
  });
}

export async function mergeGuestWishlistIntoCustomer() {
  const entries = [...useWishlistStore.getState().entries];

  if (entries.length === 0) {
    return {
      merged: 0,
      unresolved: [],
    };
  }

  let merged = 0;
  const unresolved: string[] = [];

  for (const entry of entries) {
    try {
      const data = await getNexusProduct(entry.handle);
      const product = data.product;

      if (!product) {
        unresolved.push(entry.handle);
        continue;
      }

      await addCustomerWishlistItem(
        toFrontendProduct(product),
        entry.variantId,
      );

      useWishlistStore.getState().remove(entry.handle, entry.variantId);
      merged += 1;
    } catch {
      unresolved.push(entry.handle);
    }
  }

  return {
    merged,
    unresolved,
  };
}
