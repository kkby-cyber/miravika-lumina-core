# MIRAVIKA — Media Asset Inventory

Audited 2026-10-10 on branch `claude/miravika-platform-completion-g086kj`.
**No asset was deleted, renamed, moved, re-encoded or regenerated** during the luxury
redesign. Presentation changed only through CSS, containers and component markup.

## 1. Campaign imagery (Lovable asset store, referenced via `src/assets/*.asset.json`)

Served from `/__l5e/assets-v1/<asset_id>/<file>`. Source files live in Lovable's R2 store;
the repository holds only the manifests.

| Manifest                        | Size   | Used by (after redesign)                                                     |
| ------------------------------- | ------ | ---------------------------------------------------------------------------- |
| `IMG-20260709-WA0018.jpg`       | 212 KB | Homepage hero (preloaded, `fetchpriority=high`), `og:image`, `twitter:image` |
| `IMG-20260709-WA0017.jpg`       | 221 KB | "Best Sellers" category tile fallback, Luxury Edit split, Instagram grid     |
| `IMG-20260709-WA0014.jpg`       | 237 KB | "New Arrivals" tile fallback, "For Every Day" occasion tile, Instagram grid  |
| `IMG-20260709-WA0008.jpg`       | 210 KB | Earrings & Jewelry spotlight                                                 |
| `IMG-20260709-WA0009.jpg`       | 205 KB | "For the Occasion" tile, Instagram grid                                      |
| `IMG-20260709-WA0015.jpg`       | 176 KB | "For the Celebration" tile                                                   |
| `IMG-20260709-WA0012.jpg`       | 175 KB | Brand story                                                                  |
| `IMG-20260709-WA0010.jpg`       | 254 KB | Instagram grid                                                               |
| `IMG-20260709-WA0013.jpg`       | 196 KB | Instagram grid                                                               |
| `cat-fashion.jpg`               | 61 KB  | "Hair Accessories" tile fallback                                             |
| `cat-jewelry.jpg`               | 133 KB | "Earrings & Jewelry" tile fallback, Instagram grid                           |
| `cat-gifts.jpg`                 | 141 KB | "Rakhi & Gifts" tile fallback, Instagram grid                                |
| `cat-beauty.jpg`                | 113 KB | Instagram grid                                                               |
| `miravika-logo.png`             | 473 KB | Footer                                                                       |
| `cat-home.jpg`                  | 126 KB | **Not referenced** — reported, kept                                          |
| `cat-tech.jpg`                  | 99 KB  | **Not referenced** — reported, kept                                          |
| `miravika-logo-transparent.png` | 241 KB | **Not referenced** — reported, kept                                          |

Category tiles now prefer genuine product photography (the Nexus collection image, then the
first product image in that collection) and fall back to the campaign asset listed above.

## 2. Films (`public/video/`)

| File                                     | Size            | Content (from poster)                    | Placement                           |
| ---------------------------------------- | --------------- | ---------------------------------------- | ----------------------------------- |
| `miravika-signature.mp4` + `-poster.jpg` | 1.13 MB / 45 KB | Red rose clay rakhi on champagne satin   | "The Film" band after categories    |
| `miravika-rakhi.mp4` + `-poster.jpg`     | 1.43 MB / 39 KB | Gold kundan-style rakhi on crimson satin | "Gifting Edit" band → Rakhi & Gifts |

Both keep `preload="none"`, poster-first rendering, muted in-view autoplay and visible
play/mute controls. Visitors with `prefers-reduced-motion` see the poster and a play button.

## 3. Brand files (`public/`)

`favicon.png`, `miravika-logo-gold.png` (header wordmark; also now the Organization
JSON-LD logo — it previously pointed to a non-existent `/favicon.ico`), `robots.txt`.

## 4. Product photography (`.mira-img/`)

- 404 JPEGs, ~188 MB, 125 SKU prefixes (`<SKU>-<n>.jpg`): 84 SKUs × 4 images, 6 × 3, 15 × 2,
  20 × 1. Typical sizes 1664×2219 (3:4) and 1664×1664 (1:1), art-directed on satin.
- Not referenced by any source file. Product pages read image URLs from Nexus
  (`product_images`), which is the source of truth for the SKU → image mapping.
- Product cards use a 3:4 frame with `object-fit: cover` to match the dominant ratio.

**Recommendation (not actioned):** confirm these files are mirrored in Supabase Storage /
the CDN, then consider moving them out of the git repository (188 MB slows every clone).

## 5. Orphaned data and code (reported, not removed)

- `src/data/master-catalog.json` — 100 marketplace rows, all `draft`, `approved: false`,
  not imported anywhere.
- `src/lib/marketplace-sync.ts` — not imported anywhere.
- `src/hooks/useProducts.shopify.backup.ts`, `src/stores/cartStore.shopify.backup.ts` —
  Shopify-era backups, not imported.
