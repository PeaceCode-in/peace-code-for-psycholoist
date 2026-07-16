import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { palette } from "@/components/practice/palette";
import { getPieceBySlug, listPublishedPublic, readingTimeMin, outline, trackView, markHelpful, type Block } from "@/lib/library-store";

export const Route = createFileRoute("/writing/$slug")({
  head: ({ params }) => {
    const p = typeof window !== "undefined" ? getPieceBySlug(params.slug) : undefined;
    if (!p) return { meta: [{ title: "Not found — PeaceCode writing" }, { name: "robots", content: "noindex" }] };
    const desc = (p.metaDescription || "").slice(0, 160) || "A piece from PeaceCode.";
    const title = (p.metaTitle || p.title).slice(0, 60);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/writing/${p.slug}` },
        ...(p.coverImage ? [{ property: "og:image", content: p.coverImage }, { name: "twitter:image", content: p.coverImage }] : []),
        { name: "twitter:card", content: p.coverImage ? "summary_large_image" : "summary" },
      ],
      links: [{ rel: "canonical", href: `/writing/${p.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org", "@type": "Article",
          headline: p.title, description: desc, datePublished: p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined,
          dateModified: new Date(p.updatedAt).toISOString(), image: p.coverImage,
          author: { "@type": "Person", name: "Dr. Sample Clinician" },
          publisher: { "@type": "Organization", name: "PeaceCode" },
        }),
      }],
    };
  },
  component: PieceReader,
  notFoundComponent: () => (
    <main className="max-w-[600px] mx-auto px-8 py-24 text-center">
      <p className="text-[22px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Piece not found.</p>
      <Link to="/writing" className="text-[12px] mt-3 inline-block hover:underline" style={{ color: palette.primary }}>Back to writing</Link>
    </main>
  ),
});

function PieceReader() {
  const { slug } = Route.useParams();
  const p = typeof window !== "undefined" ? getPieceBySlug(slug) : undefined;
  useEffect(() => { if (p) trackView(p.id); }, [p?.id]);
  const related = useMemo(() => {
    if (!p) return [];
    return listPublishedPublic().filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
  }, [p]);
  if (!p) throw notFound();
  const rt = readingTimeMin(p.blocks);
  const ol = outline(p.blocks);

  return (
    <article className="max-w-[1000px] mx-auto px-5 sm:px-8 py-10 lg:py-16">
      <div className="text-[10.5px] uppercase tracking-[0.18em] mb-4" style={{ color: palette.primary, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        {p.category} · {rt} min read
      </div>
      <h1 className="text-[clamp(2rem,4.2vw,3.6rem)] tracking-tight leading-[1.02]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.title}</h1>
      {p.subtitle && <p className="text-[18px] italic mt-3 max-w-[62ch]" style={{ fontFamily: "'Fraunces', serif", color: palette.muted }}>{p.subtitle}</p>}
      <div className="mt-6 text-[11.5px] flex items-center gap-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span>Dr. Sample Clinician</span> · <span>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "Draft"}</span>
      </div>

      {p.coverImage && <img src={p.coverImage} alt={p.title} className="w-full h-64 sm:h-96 object-cover rounded-2xl mt-8" />}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-10">
        <div className="prose-editorial" style={{ maxWidth: "68ch" }}>
          {p.blocks.map((b, i) => <RenderBlock key={b.id} b={b} first={i === 0 && b.type === "p"} />)}
          <div className="mt-16 pt-6 border-t flex items-center gap-3" style={{ borderColor: palette.border }}>
            <button onClick={() => { markHelpful(p.id); }} className="inline-flex items-center gap-2 h-9 px-4 rounded-full border text-[12px]" style={{ borderColor: palette.border, color: palette.ink }}>
              ♡ Helpful · {p.analytics.helpful}
            </button>
            <button onClick={() => navigator.share?.({ title: p.title, url: window.location.href }).catch(() => {})} className="inline-flex items-center gap-2 h-9 px-4 rounded-full border text-[12px]" style={{ borderColor: palette.border, color: palette.muted }}>
              Share
            </button>
          </div>
        </div>
        {ol.length > 0 && (
          <aside className="hidden lg:block sticky top-20 self-start">
            <div className="text-[10.5px] uppercase tracking-[0.16em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>In this piece</div>
            <ul className="space-y-2">
              {ol.map((o, i) => (
                <li key={i} className="text-[12px] leading-snug" style={{ color: palette.muted, paddingLeft: o.level === 3 ? 10 : 0, fontFamily: "'Fraunces', serif" }}>{o.text}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-24 pt-10 border-t" style={{ borderColor: palette.border }}>
          <div className="text-[11px] uppercase tracking-[0.16em] mb-6" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Also on {p.category}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((r) => (
              <Link key={r.id} to="/writing/$slug" params={{ slug: r.slug }} className="block group">
                <div className="h-28 rounded-xl mb-3" style={{ background: r.coverImage ? `center/cover url(${r.coverImage})` : `linear-gradient(135deg, ${palette.soft}, ${palette.lavender})` }} />
                <div className="text-[14px] leading-tight group-hover:underline underline-offset-4 decoration-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{r.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function RenderBlock({ b, first }: { b: Block; first?: boolean }) {
  if (b.type === "h2") return <h2 className="text-[28px] tracking-tight mt-14 mb-4" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{b.text}</h2>;
  if (b.type === "h3") return <h3 className="text-[20px] mt-10 mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{b.text}</h3>;
  if (b.type === "p") return (
    <p className={"text-[17px] leading-[1.7] mt-5" + (first ? " first-letter:text-[3.4em] first-letter:float-left first-letter:mr-2 first-letter:leading-[0.9] first-letter:italic first-letter:font-serif" : "")}
      style={{ color: palette.ink, fontFamily: "'DM Sans', sans-serif" }}>{b.text}</p>
  );
  if (b.type === "quote") return (
    <blockquote className="border-l-2 pl-5 my-8 italic text-[19px] leading-relaxed" style={{ borderColor: palette.primary, fontFamily: "'Fraunces', serif", color: palette.ink }}>
      "{b.text}"{b.by && <cite className="block text-[12.5px] not-italic mt-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>— {b.by}</cite>}
    </blockquote>
  );
  if (b.type === "pull") return (
    <p className="text-[24px] leading-tight my-10 italic text-center max-w-[24ch] mx-auto" style={{ fontFamily: "'Fraunces', serif", color: palette.primary }}>"{b.text}"</p>
  );
  if (b.type === "callout") return (
    <div className="my-8 rounded-2xl border px-5 py-4 text-[14px] leading-relaxed"
      style={{ borderColor: b.kind === "caution" ? "#E9D7A3" : palette.border, background: b.kind === "caution" ? "#FBF5E6" : palette.surface2, color: b.kind === "caution" ? "#5A4416" : palette.ink }}>
      {b.text}
    </div>
  );
  if (b.type === "image") return (
    <figure className="my-10">
      <img src={b.src} alt={b.alt} className="w-full rounded-2xl" />
      {b.caption && <figcaption className="text-[12px] italic mt-2 text-center" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{b.caption}</figcaption>}
    </figure>
  );
  if (b.type === "video") return (
    <figure className="my-10">
      <div className="aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: palette.border }}>
        <iframe src={b.src} title={b.caption ?? "Video"} className="w-full h-full" allowFullScreen />
      </div>
      {b.caption && <figcaption className="text-[12px] italic mt-2 text-center" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{b.caption}</figcaption>}
    </figure>
  );
  if (b.type === "audio") return (
    <figure className="my-10">
      <audio controls src={b.src} className="w-full">Audio</audio>
      {b.caption && <figcaption className="text-[12px] italic mt-2 text-center" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{b.caption}</figcaption>}
    </figure>
  );
  if (b.type === "reference") return (
    <p className="text-[12px] mt-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      {b.author} ({b.year}). <em>{b.title}</em>{b.url && <>. <a href={b.url} className="underline" target="_blank" rel="noreferrer">link</a></>}
    </p>
  );
  return null;
}
