import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getNexusProducts } from "@/lib/nexus";

const BASE_URL = "https://miravika.com";

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

const COLLECTIONS = [
  "new-arrivals",
  "trending-now",
  "womens-fashion",
  "jewelry-accessories",
  "beauty-personal-care",
  "home-kitchen",
  "electronics-accessories",
  "gifts",
  "best-sellers",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let productPaths: string[] = [];

        try {
          const data = await getNexusProducts({ limit: 250, offset: 0 });
          productPaths = (data.products ?? [])
            .filter((product) => product.slug)
            .map((product) => `/product/${product.slug}`);
        } catch {
          // Keep sitemap valid if Nexus is temporarily unavailable.
        }

        const urls = [
          ...STATIC_PATHS.map(([path, freq, priority]) =>
            `  <url><loc>${BASE_URL}${path}</loc><changefreq>${freq}</changefreq>${priority ? `<priority>${priority}</priority>` : ""}</url>`,
          ),
          ...COLLECTIONS.map((slug) =>
            `  <url><loc>${BASE_URL}/collection/${slug}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
          ),
          ...productPaths.map((path) =>
            `  <url><loc>${BASE_URL}${path}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
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
