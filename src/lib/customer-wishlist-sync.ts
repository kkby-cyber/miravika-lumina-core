import { getCustomerSession } from "@/lib/customer-auth";
import { loadCustomerWishlist, mergeGuestWishlistIntoCustomer } from "@/lib/customer-wishlist";
import { useWishlistStore } from "@/stores/wishlistStore";

let syncPromise: Promise<{
  authenticated: boolean;
  merged: number;
  unresolved: string[];
}> | null = null;

async function performCustomerWishlistSync() {
  const session = await getCustomerSession();

  if (!session.session) {
    useWishlistStore.getState().setHydrated(true);

    return {
      authenticated: false,
      merged: 0,
      unresolved: [],
    };
  }

  const merge = await mergeGuestWishlistIntoCustomer();
  const data = await loadCustomerWishlist();

  const entries = (data.items ?? [])
    .map((item) => {
      const handle = item.products?.slug;
      if (!handle) return null;

      return {
        handle,
        variantId: item.variant_id ?? null,
      };
    })
    .filter(
      (entry): entry is { handle: string; variantId: string | null } => Boolean(entry),
    );

  useWishlistStore.getState().setEntries(entries);
  useWishlistStore.getState().setHydrated(true);

  return {
    authenticated: true,
    merged: merge.merged,
    unresolved: merge.unresolved,
  };
}

export async function syncCustomerWishlist(): Promise<{
  authenticated: boolean;
  merged: number;
  unresolved: string[];
}> {
  if (!syncPromise) {
    syncPromise = performCustomerWishlistSync().finally(() => {
      syncPromise = null;
    });
  }

  return syncPromise;
}
