import { describe, expect, it } from "vitest";
import { LEGACY_SLUG_REDIRECTS, NAV_COLLECTIONS, resolveCollectionHandle } from "@/lib/collections";

describe("collection slug resolution", () => {
  it("maps retired campaign slugs to their canonical Nexus collection", () => {
    expect(resolveCollectionHandle("signature-collection")).toBe("best-sellers");
    expect(resolveCollectionHandle("ready-to-wear")).toBe("womens-fashion");
    expect(resolveCollectionHandle("accessories-fine-goods")).toBe("jewelry-accessories");
    expect(resolveCollectionHandle("curated-sets")).toBe("gifts");
  });

  it("leaves canonical slugs untouched", () => {
    for (const { slug } of NAV_COLLECTIONS) expect(resolveCollectionHandle(slug)).toBe(slug);
  });

  it("never redirects a canonical slug to itself via another hop", () => {
    // A redirect target must itself resolve to itself, otherwise the loader would chain.
    for (const target of Object.values(LEGACY_SLUG_REDIRECTS)) {
      expect(resolveCollectionHandle(target)).toBe(target);
    }
  });
});
