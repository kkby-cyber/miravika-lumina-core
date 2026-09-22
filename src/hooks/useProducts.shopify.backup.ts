import { useQuery } from "@tanstack/react-query";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  storefrontApiRequest,
  type ShopifyProduct,
} from "@/lib/shopify";

export function useProducts(query?: string, first = 50, enabled = true) {
  return useQuery({
    queryKey: ["shopify-products", query ?? "", first],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query: query ?? null });
      return (data?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
    enabled,
    staleTime: 60_000,
  });
}


export function useProduct(handle: string) {
  return useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      return data?.data?.product as ShopifyProduct["node"] | null;
    },
    enabled: !!handle,
  });
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  products: ShopifyProduct[];
}

export function useCollection(handle: string, first = 24) {
  return useQuery({
    queryKey: ["shopify-collection", handle, first],
    queryFn: async (): Promise<ShopifyCollection | null> => {
      const data = await storefrontApiRequest(COLLECTION_PRODUCTS_QUERY, { handle, first });
      const c = data?.data?.collection;
      if (!c) return null;
      return {
        id: c.id,
        handle: c.handle,
        title: c.title,
        description: c.description,
        image: c.image,
        products: (c.products?.edges ?? []) as ShopifyProduct[],
      };
    },
    enabled: !!handle,
    staleTime: 60_000,
  });
}
