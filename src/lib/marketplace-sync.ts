/**
 * MIRAVIKA marketplace sync architecture (Steps 10–11).
 *
 * Prepared, NOT activated. Nothing here runs on its own and nothing here
 * writes to Shopify. It defines the SKU-keyed contract every future
 * Amazon/Flipkart sync must follow so products update instead of duplicate.
 */
import masterCatalog from "@/data/master-catalog.json";

export type MarketplaceId = "amazon" | "flipkart";

export interface MasterProduct {
  /** Primary, immutable sync key. Never sync on title/handle/image name. */
  sku: string;
  fsn: string | null;
  asin: string | null;
  category: string;
  handle: string;
  flipkartUrl: string | null;
  amazonUrl: string | null;
  status: "draft" | "active";
  approved: boolean;
}

export interface MarketplaceRecord {
  sku: string;
  price?: number;
  compareAtPrice?: number;
  availableQty?: number;
  imageUrls?: string[];
  description?: string;
}

export interface SyncDiff {
  sku: string;
  action: "update" | "create" | "reject";
  reason?: string;
  fields: Record<string, { from: unknown; to: unknown }>;
}

export const MASTER_CATALOG = masterCatalog as {
  version: number;
  approved: boolean;
  products: MasterProduct[];
};

const bySku = new Map(MASTER_CATALOG.products.map((p) => [p.sku, p]));

export function lookupBySku(sku: string): MasterProduct | undefined {
  return bySku.get(sku);
}

/**
 * Field ownership. MIRAVIKA-authored content always wins; marketplaces may
 * only drive price and stock, and only when that pass is enabled.
 */
export const FIELD_OWNER = {
  title: "miravika",
  metaTitle: "miravika",
  metaDescription: "miravika",
  collections: "miravika",
  tags: "miravika",
  price: "marketplace",
  compareAtPrice: "marketplace",
  inventory: "marketplace",
  images: "additive",
  description: "miravika",
} as const;

export interface SyncPasses {
  price: boolean;
  stock: boolean;
  images: boolean;
  descriptions: boolean;
}

export const DEFAULT_PASSES: SyncPasses = {
  price: false,
  stock: false,
  images: false,
  descriptions: false,
};

/**
 * Dry-run planner. Produces the diff a live sync *would* apply.
 *
 * De-duplication guarantee: a record is only ever created when its SKU exists
 * in the approved master catalog. Unknown SKUs are rejected and logged, which
 * is what keeps dropshipped/imported products out of the catalog permanently.
 */
export function planSync(
  records: MarketplaceRecord[],
  current: Map<string, MarketplaceRecord>,
  passes: SyncPasses = DEFAULT_PASSES,
): SyncDiff[] {
  return records.map((record) => {
    const master = lookupBySku(record.sku);
    if (!master) {
      return {
        sku: record.sku,
        action: "reject",
        reason: "SKU not present in master catalog",
        fields: {},
      };
    }

    const existing = current.get(record.sku);
    const fields: SyncDiff["fields"] = {};

    if (passes.price && record.price !== undefined && record.price !== existing?.price) {
      fields["price"] = { from: existing?.price ?? null, to: record.price };
    }
    if (
      passes.stock &&
      record.availableQty !== undefined &&
      record.availableQty !== existing?.availableQty
    ) {
      fields["inventory"] = { from: existing?.availableQty ?? null, to: record.availableQty };
    }
    if (passes.images && record.imageUrls?.length) {
      const known = new Set(existing?.imageUrls ?? []);
      const added = record.imageUrls.filter((url) => !known.has(url));
      if (added.length) fields["images"] = { from: existing?.imageUrls ?? [], to: added };
    }
    if (passes.descriptions && !existing?.description && record.description) {
      fields["description"] = { from: null, to: record.description };
    }

    return { sku: record.sku, action: existing ? "update" : "create", fields };
  });
}

/** Guard for the future scheduled endpoint. Sync stays off until the catalog is approved. */
export function isSyncActivated(): boolean {
  return MASTER_CATALOG.approved;
}
