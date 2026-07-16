import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, MapPin, ShieldCheck } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useProviders } from "@/lib/cpd-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/cpd/providers")({
  component: CpdProviders,
});

function CpdProviders() {
  const hydrated = useHydrated();
  const providers = useProviders();
  const [q, setQ] = useState("");

  const filtered = providers.filter((p) =>
    !q.trim() || p.name.toLowerCase().includes(q.toLowerCase()) || (p.city ?? "").toLowerCase().includes(q.toLowerCase()) || (p.focus ?? []).some((f) => f.toLowerCase().includes(q.toLowerCase()))
  );

  if (!hydrated) return null;

  return (
    <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pb-16 space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 24 }}>Provider directory</h2>
        <p className="text-[12px] mt-1" style={{ color: palette.muted }}>Verified CPD providers. Ratings are opt-in only. No leaderboards.</p>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, city, focus" className="w-full max-w-md rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: palette.solid }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h3 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 17 }}>{p.name}</h3>
                <div className="text-[11px] mt-1 inline-flex items-center gap-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <MapPin className="h-3 w-3" />{p.city ?? "—"}
                  {p.verified && <span className="inline-flex items-center gap-0.5 ml-2" style={{ color: "#3E6A2E" }}><ShieldCheck className="h-3 w-3" />verified</span>}
                </div>
              </div>
              {p.rating && (
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-[13px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>
                    <Star className="h-3.5 w-3.5" style={{ color: palette.primary, fill: palette.primary }} />{p.rating.toFixed(1)}
                  </div>
                  <div className="text-[10px]" style={{ color: palette.muted }}>{p.timesAttended ?? 0}× attended</div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(p.focus ?? []).map((f) => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: palette.surface2, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: palette.border, background: palette.glass }}>
          <p style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 16 }}>No providers match.</p>
        </div>
      )}
    </div>
  );
}
