import { useQuery } from "@tanstack/react-query";
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

export function useProducts(query?: string, first = 50) {
  return useQuery({
    queryKey: ["shopify-products", query ?? "", first],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query: query ?? null });
      return (data?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
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
