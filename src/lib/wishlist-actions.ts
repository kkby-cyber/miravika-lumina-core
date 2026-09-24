import { getCustomerSession } from "@/lib/customer-auth";
import { addCustomerWishlistItem, removeCustomerWishlistItem } from "@/lib/customer-wishlist";
import { syncCustomerWishlist } from "@/lib/customer-wishlist-sync";
import type { FrontendProduct } from "@/lib/nexus-product";
import { useWishlistStore } from "@/stores/wishlistStore";

export async function toggleWishlistItem(
  product: FrontendProduct,
  variantId: string | null = null,
): Promise<{ wished: boolean; authenticated: boolean }> {
  const session = await getCustomerSession();

  if (!session.session) {
    const store = useWishlistStore.getState();
    const wished = store.has(product.handle, variantId);

    store.toggle(product.handle, variantId);

    return {
      wished: !wished,
      authenticated: false,
    };
  }

  const current = useWishlistStore.getState();

  if (!current.hydrated) {
    await syncCustomerWishlist();
  }

  const latest = useWishlistStore.getState();
  const wished = latest.has(product.handle, variantId);

  if (wished) {
    await removeCustomerWishlistItem(product.id, variantId);
  } else {
    await addCustomerWishlistItem(product, variantId);
  }

  if (wished) {
    latest.remove(product.handle, variantId);
  } else {
    latest.toggle(product.handle, variantId);
  }

  return {
    wished: !wished,
    authenticated: true,
  };
}
