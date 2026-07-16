import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone, Monitor, ExternalLink } from "lucide-react";
import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { useProfile } from "@/lib/profile-store";
import { useHydrated } from "@/lib/use-hydrated";
import { PublicProfileBody } from "@/components/practice/PublicProfileBody";

export const Route = createFileRoute("/profile-public/preview")({
  component: PreviewPage,
});

function PreviewPage() {
  const hydrated = useHydrated();
  const p = useProfile();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border }}>
          <button onClick={() => setDevice("desktop")} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px]" style={{ background: device === "desktop" ? palette.ink : "transparent", color: device === "desktop" ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}><Monitor className="h-3 w-3" /> Desktop</button>
          <button onClick={() => setDevice("mobile")} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px]" style={{ background: device === "mobile" ? palette.ink : "transparent", color: device === "mobile" ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}><Smartphone className="h-3 w-3" /> Mobile</button>
        </div>
        <Link to="/p/$slug" params={{ slug: p.slug }} target="_blank" className="inline-flex items-center gap-1 text-[12px]" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
        </Link>
      </div>

      <div className="mx-auto rounded-3xl border overflow-hidden" style={{ borderColor: palette.border, background: "#fff", maxWidth: device === "mobile" ? 420 : 1100 }}>
        <div className="h-8 flex items-center gap-1.5 px-3 border-b" style={{ borderColor: palette.border, background: "rgba(0,0,0,0.03)" }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
          <div className="ml-3 text-[10px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>peacecode.app/p/{p.slug}</div>
        </div>
        <div className="bg-white">
          <PublicProfileBody profile={p} />
        </div>
      </div>
    </div>
  );
}
