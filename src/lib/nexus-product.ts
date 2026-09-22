import type { NexusProduct, NexusVariant } from "@/lib/nexus";

export interface FrontendProductImage {
  url: string;
  altText: string | null;
}

export interface FrontendProductOption {
  name: string;
  values: string[];
}

export interface FrontendProductVariant {
  id: string;
  sku: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  mrp: {
    amount: string;
    currencyCode: string;
  } | null;
  compareAtPrice: {
    amount: string;
    currencyCode: string;
  } | null;
  availableForSale: boolean;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

export interface FrontendProduct {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  handle: string;
  availableForSale: boolean;
  productType: string;
  tags: string[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPrice: {
    amount: string;
    currencyCode: string;
  } | null;
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: FrontendProductImage;
    }>;
  };
  variants: {
    edges: Array<{
      node: FrontendProductVariant;
    }>;
  };
  options: FrontendProductOption[];
  media: {
    edges: Array<{
      node: {
        mediaContentType: string;
        embeddedUrl?: string;
        previewImage?: {
          url: string;
          altText: string | null;
        } | null;
        sources?: Array<{
          url: string;
          mimeType: string;
        }>;
      };
    }>;
  };
  brand: string;
  sku: string;
  mrp: string | null;
  price: string;
  inventoryQuantity: number;
}

function money(value: number | string | null | undefined) {
  return {
    amount: String(value ?? 0),
    currencyCode: "INR",
  };
}

function variantAttributes(
  variant: NexusVariant,
): Array<{ name: string; value: string }> {
  if (!variant.attributes || typeof variant.attributes !== "object") {
    return variant.title && variant.title !== "Default Title"
      ? [{ name: "Title", value: variant.title }]
      : [];
  }

  return Object.entries(variant.attributes)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([name, value]) => ({
      name,
      value: String(value),
    }));
}

export function toFrontendVariant(
  variant: NexusVariant,
  inventoryQuantity = 0,
): FrontendProductVariant {
  return {
    id: variant.id,
    sku: variant.sku,
    title: variant.title,
    price: money(variant.price),
    mrp: variant.mrp != null ? money(variant.mrp) : null,
    compareAtPrice: variant.mrp != null ? money(variant.mrp) : null,
    availableForSale: inventoryQuantity > 0,
    selectedOptions: variantAttributes(variant),
  };
}

export function toFrontendProduct(product: NexusProduct): FrontendProduct {
  const images = [...(product.product_images ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((image) => ({
      node: {
        url: image.url,
        altText: image.alt_text ?? product.title,
      },
    }));

  const variants = (product.product_variants ?? []).map((variant) => {
    const inventory = product.inventory?.find(
      (item) => item.sku === variant.sku,
    );

    return {
      node: toFrontendVariant(variant, inventory?.available_quantity ?? 0),
    };
  });

  const fallbackVariant: FrontendProductVariant = {
    id: product.id,
    sku: product.sku,
    title: "Default Title",
    price: money(product.price),
    mrp: product.mrp != null ? money(product.mrp) : null,
    compareAtPrice: product.mrp != null ? money(product.mrp) : null,
    availableForSale: (product.inventory?.[0]?.available_quantity ?? 0) > 0,
    selectedOptions: [],
  };

  const normalizedVariants =
    variants.length > 0 ? variants : [{ node: fallbackVariant }];

  const minPrice = Math.min(
    ...normalizedVariants.map((v) => Number(v.node.price.amount)),
  );

  const compareAt =
    product.compare_at_price != null
      ? money(product.compare_at_price)
      : null;

  const tags = [
    product.product_type,
    product.material,
    product.color,
    product.size,
  ].filter((value): value is string => Boolean(value));

  const optionMap = new Map<string, Set<string>>();

  for (const variant of normalizedVariants) {
    for (const option of variant.node.selectedOptions) {
      if (!optionMap.has(option.name)) {
        optionMap.set(option.name, new Set());
      }
      optionMap.get(option.name)!.add(option.value);
    }
  }

  const options: FrontendProductOption[] = Array.from(optionMap.entries()).map(
    ([name, values]) => ({
      name,
      values: Array.from(values),
    }),
  );

  return {
    id: product.id,
    title: product.title,
    description: product.description ?? product.short_description ?? "",
    shortDescription: product.short_description ?? "",
    handle: product.slug,
    availableForSale:
      (product.inventory ?? []).some(
        (inventory) => inventory.available_quantity > 0,
      ) || normalizedVariants.some((variant) => variant.node.availableForSale),
    productType: product.product_type ?? "",
    tags,
    priceRange: {
      minVariantPrice: money(minPrice),
    },
    compareAtPrice: compareAt,
    compareAtPriceRange: compareAt
      ? { minVariantPrice: compareAt }
      : undefined,
    images: {
      edges: images,
    },
    variants: {
      edges: normalizedVariants,
    },
    options,
    media: {
      edges: [],
    },
    brand: product.brand ?? "MIRAVIKA",
    sku: product.sku,
    mrp: product.mrp != null ? String(product.mrp) : null,
    price: String(product.price),
    inventoryQuantity:
      product.inventory?.reduce(
        (total, item) => total + Number(item.available_quantity || 0),
        0,
      ) ?? 0,
  };
}

export function toFrontendProducts(products: NexusProduct[]): FrontendProduct[] {
  return products.map(toFrontendProduct);
}
