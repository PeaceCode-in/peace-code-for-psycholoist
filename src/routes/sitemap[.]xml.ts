import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { MARKETING_FEATURES, MARKETING_STATIC_ROUTES } from "@/lib/marketing-features";

// Absolute canonical origin — the marketing site lives on this subdomain.
const BASE_URL = "https://psychologist.peacecode.in";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const today = new Date().toISOString().slice(0, 10);

        const entries = [
          ...MARKETING_STATIC_ROUTES,
          ...MARKETING_FEATURES.map((f) => ({
            path: `/features/${f.slug}`,
            priority: "0.8",
            changefreq: "monthly" as const,
          })),
        ];

        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

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
