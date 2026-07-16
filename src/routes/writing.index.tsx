import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { palette } from "@/components/practice/palette";
import { listPublishedPublic, readingTimeMin, excerpt, type PieceCategory } from "@/lib/library-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/writing/")({ component: WritingIndex });

const CATEGORIES: PieceCategory[] = ["Anxiety", "Depression", "Relationships", "Life transitions", "Sleep", "Trauma", "Growth", "Practice announcements"];

function WritingIndex() {
  const hydrated = useHydrated();
  const pieces = hydrated ? listPublishedPublic() : [];
  const [cat, setCat] = useState<PieceCategory | "all">("all");
  const list = useMemo(() => cat === "all" ? pieces : pieces.filter((p) => p.category === cat), [pieces, cat]);
  const featured = list[0];
  const rest = list.slice(1);

  if (!hydrated) return <div className="max-w-[1200px] mx-auto px-8 py-24 text-[11px] uppercase" style={{ color: palette.muted }}>Loading…</div>;

  return (
    <main className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 lg:py-16">
      <h1 className="text-[clamp(2.4rem,5vw,4rem)] tracking-tight leading-[0.98]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
        Writing from the practice.
      </h1>
      <p className="text-[15px] mt-4 max-w-[52ch] leading-relaxed" style={{ color: palette.muted }}>
        Articles, guides and worksheets by working clinicians. Written to be useful before it is impressive.
      </p>

      <div className="flex flex-wrap gap-1.5 mt-8 mb-10">
        <button onClick={() => setCat("all")} className="rounded-full px-3 py-1 text-[11.5px] border" style={{ borderColor: palette.border, background: cat === "all" ? palette.ink : "transparent", color: cat === "all" ? "#fff" : palette.muted }}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className="rounded-full px-3 py-1 text-[11.5px] border" style={{ borderColor: palette.border, background: cat === c ? palette.ink : "transparent", color: cat === c ? "#fff" : palette.muted }}>{c}</button>
        ))}
      </div>

      {list.length === 0 && <p className="italic" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Nothing published in this category yet.</p>}

      {featured && (
        <Link to="/writing/$slug" params={{ slug: featured.slug }} className="block group mb-16">
          <div className="rounded-3xl overflow-hidden border" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="h-64 sm:h-80" style={{ background: featured.coverImage ? `center/cover url(${featured.coverImage})` : `linear-gradient(135deg, ${palette.soft}, ${palette.lavender})` }} />
            <div className="p-8 lg:p-10">
              <div className="text-[10.5px] uppercase tracking-[0.18em] mb-3" style={{ color: palette.primary, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{featured.category} · {readingTimeMin(featured.blocks)} min</div>
              <h2 className="text-[clamp(1.6rem,2.8vw,2.4rem)] leading-tight tracking-tight group-hover:underline underline-offset-4 decoration-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{featured.title}</h2>
              {featured.subtitle && <p className="text-[15px] italic mt-2" style={{ fontFamily: "'Fraunces', serif", color: palette.muted }}>{featured.subtitle}</p>}
              <p className="text-[14px] mt-4 leading-relaxed max-w-[62ch]" style={{ color: palette.ink }}>{excerpt(featured.blocks, 220)}</p>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rest.map((p) => (
          <Link key={p.id} to="/writing/$slug" params={{ slug: p.slug }} className="block group">
            <div className="rounded-2xl overflow-hidden border mb-4" style={{ borderColor: palette.border, background: palette.glass }}>
              <div className="h-40" style={{ background: p.coverImage ? `center/cover url(${p.coverImage})` : `linear-gradient(135deg, ${palette.soft}, ${palette.lavender})` }} />
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] mb-1.5" style={{ color: palette.primary, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.category} · {readingTimeMin(p.blocks)} min</div>
            <h3 className="text-[19px] leading-tight tracking-tight group-hover:underline underline-offset-4 decoration-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.title}</h3>
            {p.subtitle && <p className="text-[12.5px] italic mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.muted }}>{p.subtitle}</p>}
            <p className="text-[13px] mt-2 leading-relaxed line-clamp-3" style={{ color: palette.muted }}>{excerpt(p.blocks, 160)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
