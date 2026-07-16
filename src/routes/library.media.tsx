import { createFileRoute, Link } from "@tanstack/react-router";
import { Film, Music, ImageIcon } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLivePieces } from "@/lib/library-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/library/media")({ component: Media });

function Media() {
  const hydrated = useHydrated();
  const pieces = useLivePieces();
  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>Loading…</div>;
  const media = pieces.filter((p) => p.format === "Video" || p.format === "Podcast" || p.blocks.some((b) => b.type === "video" || b.type === "audio" || b.type === "image"));
  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <p className="text-[12.5px] mb-5" style={{ color: palette.muted }}>Video, audio and images. URLs for now — object storage lands with #29.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {media.map((p) => {
          const Icon = p.format === "Video" ? Film : p.format === "Podcast" ? Music : ImageIcon;
          return (
            <Link key={p.id} to="/library/$pid" params={{ pid: p.id }} className="rounded-2xl border p-5 hover:shadow-sm transition-all" style={{ borderColor: palette.border, background: palette.glassStrong }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: palette.soft, color: palette.primary }}><Icon className="h-4.5 w-4.5" /></div>
                <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>{p.format}</span>
              </div>
              <div className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.title}</div>
              <div className="text-[11px] mt-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.analytics.views.toLocaleString()} views · {p.analytics.completions.toLocaleString()} completions</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
