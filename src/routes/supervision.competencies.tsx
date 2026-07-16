import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Target, TrendingUp } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useCompetencies, updateCompetency } from "@/lib/supervision-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/supervision/competencies")({
  component: Competencies,
});

const LEVEL_LABEL = ["Novice", "Advanced beginner", "Competent", "Proficient", "Expert"] as const;

function Competencies() {
  const hydrated = useHydrated();
  const competencies = useCompetencies();
  const [editing, setEditing] = useState<string | null>(null);

  if (!hydrated) return null;

  const gap = competencies.filter((c) => c.level < c.targetLevel).length;
  const met = competencies.filter((c) => c.level >= c.targetLevel).length;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Domains tracked" value={String(competencies.length)} sub="from framework" />
        <Stat label="At or above target" value={String(met)} sub={`${Math.round((met / competencies.length) * 100)}%`} />
        <Stat label="Gap domains" value={String(gap)} sub="focus for supervision" tone={gap ? "warn" : "ok"} />
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
        {competencies.map((c) => {
          const behind = c.level < c.targetLevel;
          return (
            <div key={c.id} className="p-5 border-t first:border-t-0" style={{ borderColor: palette.border }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    <Target className="h-3 w-3" /> {c.domain}
                  </div>
                  <div className="mt-1 text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{c.descriptor}</div>
                  <div className="mt-1 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    Last reviewed {new Date(c.lastReviewedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {c.evidenceRefs.length} evidence link{c.evidenceRefs.length === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Level → target</div>
                  <div className="mt-1 text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: behind ? "#B85A3E" : palette.ink }}>
                    {c.level} → {c.targetLevel}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {[0, 1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateCompetency(c.id, { level: n as 0 | 1 | 2 | 3 | 4 })}
                    className="flex-1 h-2 rounded-full transition-all duration-[180ms]"
                    style={{ background: n <= c.level ? palette.ink : "rgba(0,0,0,0.08)" }}
                    title={LEVEL_LABEL[n]}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {LEVEL_LABEL.map((l) => <span key={l}>{l}</span>)}
              </div>

              {behind && (
                <div className="mt-3 inline-flex items-center gap-1 text-[11px]" style={{ color: "#B85A3E", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <TrendingUp className="h-3 w-3" /> Bring to next supervision session
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone = "ok" }: { label: string; value: string; sub: string; tone?: "ok" | "warn" }) {
  const border = tone === "warn" ? "rgba(203,108,84,0.4)" : palette.border;
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
      <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-1 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</div>
      <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{sub}</div>
    </div>
  );
}
