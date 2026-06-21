import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

const STATIC_PATHS = [
  "/", "/shop", "/search", "/wishlist", "/cart", "/about", "/contact", "/track-order",
  "/faq", "/shipping-policy", "/return-policy", "/privacy-policy", "/terms", "/account",
  "/collection/scrunchies", "/collection/bows", "/collection/clips", "/collection/bands", "/collection/accessories",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = STATIC_PATHS.map(
          (p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`,
        ).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
