import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  NexusApiError,
  getNexusCollections,
  getNexusProduct,
  getNexusProducts,
  type NexusCollection,
} from "@/lib/nexus";
import { toFrontendProduct, toFrontendProducts, type FrontendProduct } from "@/lib/nexus-product";

export type StoreProduct = FrontendProduct;
export type StoreCollection = NexusCollection;

export function useProducts(query?: string, first = 50, enabled = true) {
  return useQuery({
    queryKey: ["nexus-products", query ?? "", first],
    queryFn: async () => {
      const data = await getNexusProducts({
        limit: first,
        query,
      });

      return toFrontendProducts(data.products);
    },
    enabled,
    staleTime: 60_000,
  });
}

/**
 * Resolves to `null` only when Nexus says the product does not exist (404). Network and
 * server failures still throw, so an outage is never presented as "product not found".
 */
export function productQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["nexus-product", slug],
    queryFn: async (): Promise<FrontendProduct | null> => {
      try {
        const data = await getNexusProduct(slug);
        return data.product ? toFrontendProduct(data.product) : null;
      } catch (error) {
        if (error instanceof NexusApiError && (error.status === 404 || error.code === "NOT_FOUND"))
          return null;
        throw error;
      }
    },
    staleTime: 60_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({ ...productQueryOptions(slug), enabled: !!slug });
}

export function useCollection(slug: string, first = 24) {
  return useQuery({
    queryKey: ["nexus-collection", slug, first],
    queryFn: async (): Promise<{
      id: string;
      handle: string;
      title: string;
      description: string;
      image: { url: string; altText: string | null } | null;
      products: FrontendProduct[];
    } | null> => {
      const collectionData = await getNexusCollections();

      const collection = collectionData.collections.find((item) => item.slug === slug);

      if (!collection) return null;

      const productsData = await getNexusProducts({
        limit: first,
        collection: slug,
      });

      return {
        id: collection.id,
        handle: collection.slug,
        title: collection.title,
        description: collection.description ?? "",
        image: collection.image_url
          ? {
              url: collection.image_url,
              altText: collection.title,
            }
          : null,
        products: toFrontendProducts(productsData.products),
      };
    },
    enabled: !!slug,
    staleTime: 60_000,
  });
}

/** Live, ACTIVE Nexus collections (used to hide navigation for collections that don't exist). */
export function useCollections() {
  return useQuery({
    queryKey: ["nexus-collections"],
    queryFn: async () => (await getNexusCollections()).collections,
    staleTime: 5 * 60_000,
  });
}
