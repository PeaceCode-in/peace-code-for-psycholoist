import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { getSeries, piecesInSeries, readingTimeMin, excerpt } from "@/lib/library-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/library/series/$sid")({ component: SeriesPage });

function SeriesPage() {
  const hydrated = useHydrated();
  const { sid } = Route.useParams();
  if (!hydrated) return <div className="max-w-[1000px] mx-auto px-8 py-16 text-[11px] uppercase" style={{ color: palette.muted }}>Loading…</div>;
  const s = getSeries(sid);
  if (!s) return <div className="max-w-[1000px] mx-auto px-8 py-16 text-center"><p style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Series not found.</p><Link to="/library" className="text-[12px] mt-2 inline-block hover:underline" style={{ color: palette.primary }}>Back</Link></div>;
  const pieces = piecesInSeries(sid);
  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 pb-24">
      <Link to="/library" className="inline-flex items-center gap-1 text-[12px] mb-6" style={{ color: palette.muted }}><ArrowLeft className="h-3.5 w-3.5" /> Library</Link>
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] mb-3" style={{ color: palette.primary, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <BookOpen className="h-3 w-3" /> Series · {pieces.length} parts
        </div>
        <h1 className="text-[clamp(2rem,3.6vw,3rem)] tracking-tight leading-[1.05]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{s.title}</h1>
        <p className="text-[15px] mt-3 max-w-[62ch] leading-relaxed italic" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{s.description}</p>
      </div>
      <ol className="space-y-4">
        {pieces.map((p, i) => (
          <li key={p.id}>
            <Link to="/library/$pid" params={{ pid: p.id }} className="block rounded-2xl border p-5 hover:shadow-sm transition-all" style={{ borderColor: palette.border, background: palette.glassStrong }}>
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] tabular-nums" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <div className="text-[17px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.title}</div>
                  {p.subtitle && <div className="text-[12.5px] mt-1 italic" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{p.subtitle}</div>}
                  <p className="text-[12.5px] mt-2 leading-relaxed line-clamp-2" style={{ color: palette.muted }}>{excerpt(p.blocks, 160)}</p>
                  <div className="text-[10.5px] mt-2 uppercase tracking-[0.14em]" style={{ color: palette.muted }}>{readingTimeMin(p.blocks)} min · {p.status}</div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
