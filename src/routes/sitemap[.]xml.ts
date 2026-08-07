import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { storefrontApiRequest, PRODUCTS_QUERY } from "@/lib/shopify";

const BASE_URL = "https://miravika-lumina-core.lovable.app";

const STATIC_PATHS: [string, string, string?][] = [
  ["/", "daily", "1.0"],
  ["/shop", "daily", "0.9"],
  ["/about", "monthly", "0.6"],
  ["/contact", "monthly", "0.6"],
  ["/faq", "monthly", "0.6"],
  ["/track-order", "monthly", "0.5"],
  ["/shipping-policy", "yearly", "0.4"],
  ["/return-policy", "yearly", "0.4"],
  ["/privacy-policy", "yearly", "0.4"],
  ["/terms", "yearly", "0.4"],
];

// Live Shopify collection handles
const COLLECTIONS = [
  "new-arrivals",
  "trending-now",
  "womens-fashion",
  "jewelry-accessories",
  "beauty-personal-care",
  "gifts",
  "best-sellers",
];

interface ProdEdge { node: { handle: string } }

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let productPaths: string[] = [];
        try {
          const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 250, query: null });
          const edges = (data?.data?.products?.edges ?? []) as ProdEdge[];
          productPaths = edges.map((e) => `/product/${e.node.handle}`);
        } catch {
          /* If Shopify is unavailable at build/serve, still return static + collection urls */
        }

        const urls = [
          ...STATIC_PATHS.map(
            ([p, freq, pri]) =>
              `  <url><loc>${BASE_URL}${p}</loc><changefreq>${freq}</changefreq>${pri ? `<priority>${pri}</priority>` : ""}</url>`,
          ),
          ...COLLECTIONS.map(
            (h) =>
              `  <url><loc>${BASE_URL}/collection/${h}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
          ),
          ...productPaths.map(
            (p) =>
              `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
          ),
        ].join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
