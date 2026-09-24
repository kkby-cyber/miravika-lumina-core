import { getCustomerSession } from "@/lib/customer-auth";
import { loadCustomerWishlist, mergeGuestWishlistIntoCustomer } from "@/lib/customer-wishlist";
import { useWishlistStore } from "@/stores/wishlistStore";

let syncPromise: Promise<{
  authenticated: boolean;
  merged: number;
  unresolved: string[];
  handles: string[];
}> | null = null;

async function performCustomerWishlistSync() {
  const session = await getCustomerSession();

  if (!session.session) {
    const handles = useWishlistStore.getState().handles;
    useWishlistStore.getState().setHydrated(true);

    return {
      authenticated: false,
      merged: 0,
      unresolved: [],
      handles,
    };
  }

  const merge = await mergeGuestWishlistIntoCustomer();
  const data = await loadCustomerWishlist();

  const handles = (data.items ?? [])
    .map((item) => item.products?.slug)
    .filter((handle): handle is string => Boolean(handle));

  useWishlistStore.getState().setHandles(handles);
  useWishlistStore.getState().setHydrated(true);

  return {
    authenticated: true,
    merged: merge.merged,
    unresolved: merge.unresolved,
    handles,
  };
}

export async function syncCustomerWishlist(): Promise<{
  authenticated: boolean;
  merged: number;
  unresolved: string[];
  handles: string[];
}> {
  if (!syncPromise) {
    syncPromise = performCustomerWishlistSync().finally(() => {
      syncPromise = null;
    });
  }

  return syncPromise;
}
