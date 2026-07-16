import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProfileBySlug } from "@/lib/profile-store";
import { PublicProfileBody } from "@/components/practice/PublicProfileBody";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/p/$slug")({
  loader: ({ params }) => {
    const p = getProfileBySlug(params.slug);
    if (!p) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const p = getProfileBySlug(params.slug);
    if (!p) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const meta = [
      { title: p.seoTitle },
      { name: "description", content: p.seoDescription },
      { property: "og:title", content: p.seoTitle },
      { property: "og:description", content: p.seoDescription },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: `/p/${p.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (p.temporarilyPrivate) meta.push({ name: "robots", content: "noindex, nofollow" });
    const links = [{ rel: "canonical", href: `/p/${p.slug}` }];
    const scripts = p.jsonLdEnabled ? [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: p.displayName,
          jobTitle: "Clinical Psychologist",
          description: p.seoDescription,
          address: { "@type": "PostalAddress", addressLocality: p.city },
          knowsLanguage: p.languages,
          alumniOf: p.credentials.map((c) => c.label),
          knowsAbout: p.specialties,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: p.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ] : [];
    return { meta, links, scripts };
  },
  component: PublicProfilePage,
  notFoundComponent: NotFound,
});

function NotFound() {
  return <div style={{ padding: 60, textAlign: "center", fontFamily: "system-ui" }}>Profile not found.</div>;
}

function PublicProfilePage() {
  const { slug } = Route.useParams();
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const p = getProfileBySlug(slug);
  if (!p) return <NotFound />;

  if (p.temporarilyPrivate) {
    return (
      <div style={{ maxWidth: 560, margin: "80px auto", padding: 32, textAlign: "center", fontFamily: "'Fraunces', serif" }}>
        <div style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#7a7770" }}>Temporarily private</div>
        <h1 style={{ fontSize: 28, marginTop: 12 }}>{p.displayName}</h1>
        <p style={{ marginTop: 16, color: "#3a3a3a" }}>{p.temporarilyPrivateReason || "This profile is temporarily unavailable."}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <PublicProfileBody profile={p} />
    </div>
  );
}
