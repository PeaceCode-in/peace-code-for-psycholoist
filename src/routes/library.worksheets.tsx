import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Share2, FileText } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLivePieces } from "@/lib/library-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/library/worksheets")({ component: Worksheets });

function Worksheets() {
  const hydrated = useHydrated();
  const pieces = useLivePieces();
  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>Loading…</div>;
  const ws = pieces.filter((p) => p.format === "Worksheet");
  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <p className="text-[12.5px] mb-5" style={{ color: palette.muted }}>Downloadable resources. Bulk-share to patients via Messages.</p>
      {ws.length === 0 ? (
        <div className="rounded-3xl border p-16 text-center" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
          <p className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>No worksheets yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {ws.map((p) => (
            <div key={p.id} className="rounded-2xl border p-5 flex items-center gap-4" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: palette.soft, color: palette.primary }}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to="/library/$pid" params={{ pid: p.id }} className="text-[14.5px] hover:underline block" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.title}</Link>
                <div className="text-[11px] mt-1 flex items-center gap-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <span>{p.audience}</span> · <span>{p.analytics.shares} shares</span> · <span>{p.analytics.helpful} marked helpful</span>
                </div>
              </div>
              <button onClick={() => alert("Bulk-share to patients — wire to /messages/compose")}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11.5px]" style={{ borderColor: palette.border, color: palette.muted }}>
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <a href={p.worksheetPdfUrl ?? "#"} onClick={(e) => { if (!p.worksheetPdfUrl) { e.preventDefault(); alert("PDF export queued."); } }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11.5px]" style={{ background: palette.ink, color: "#fff" }}>
                <Download className="h-3.5 w-3.5" /> PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
