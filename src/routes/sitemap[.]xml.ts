import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Subdomain psychologist.peacecode.in — absolute URLs required by sitemaps spec.
const BASE_URL = "https://psychologist.peacecode.in";

const FEATURE_SLUGS = [
  "scheduling", "notes", "assessments", "billing", "telehealth", "teams",
  "compliance", "copilot", "patients", "messages", "homework", "groups",
  "referrals", "supervision", "cpd", "documents", "library", "analytics",
  "safety", "integrations", "waitlist", "profile", "team",
];

const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PATHS: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/for-psychologists", priority: "1.0", changefreq: "weekly" },
  { path: "/features", priority: "0.9", changefreq: "weekly" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const entries = [
          ...STATIC_PATHS,
          ...FEATURE_SLUGS.map((s) => ({ path: `/features/${s}`, priority: "0.8", changefreq: "monthly" })),
        ];
        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
