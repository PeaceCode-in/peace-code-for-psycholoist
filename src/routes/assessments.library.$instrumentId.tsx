import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Clock, Copy, Eye, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { palette } from "@/components/practice/palette";
import {
  useLiveInstruments, useLiveResults, DOMAIN_META, addCustomInstrument,
} from "@/lib/assessments-store";
import { SeveritySpectrum } from "@/components/viz/assessments/SeveritySpectrum";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/assessments/library/$instrumentId")({
  head: ({ params }) => ({ meta: [{ title: `${params.instrumentId.toUpperCase()} — PeaceCode` }] }),
  component: InstrumentDetail,
});

function InstrumentDetail() {
  const hydrated = useHydrated();
  const { instrumentId } = Route.useParams();
  const instruments = useLiveInstruments();
  const results = useLiveResults();
  const navigate = useNavigate();

  const inst = instruments.find((i) => i.id === instrumentId);

  // Population norms — derived from seeded results
  const norms = useMemo(() => {
    if (!inst) return null;
    const scores = results.filter((r) => r.instrumentId === instrumentId).map((r) => r.totalScore);
    if (!scores.length) return null;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const bands = new Map<string, number>();
    inst.scoring.ranges.forEach((b) => bands.set(b.label, 0));
    results.filter((r) => r.instrumentId === instrumentId).forEach((r) => {
      const band = inst.scoring.ranges.find((b) => r.totalScore >= b.min && r.totalScore <= b.max);
      if (band) bands.set(band.label, (bands.get(band.label) ?? 0) + 1);
    });
    return { median, bands: [...bands.entries()], n: scores.length };
  }, [results, instrumentId, inst]);

  if (!hydrated) return null;
  if (!inst) throw notFound();

  function duplicate() {
    addCustomInstrument({
      name: `${inst.name} (copy)`,
      fullName: inst.fullName,
      domain: "custom",
      items: inst.items.map((it, i) => ({ ...it, id: `c_${i + 1}` })),
      scoring: inst.scoring,
      timeToComplete: inst.timeToComplete,
      frequency: inst.frequency,
    });
    toast.success("Duplicated to your custom instruments");
    navigate({ to: "/assessments/library" });
  }

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 md:px-8 py-8">
      <Link to="/assessments/library" className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="w-3 h-3" /> Library
      </Link>

      <header className="mb-8">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 56 }}>{inst.name}</h1>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px]" style={{ background: palette.soft, color: palette.ink }}>{DOMAIN_META[inst.domain]}</span>
          <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: palette.muted }}><Clock className="w-3 h-3" />{inst.timeToComplete} min · {inst.frequency}</span>
        </div>
        <p className="text-[14.5px] mt-2" style={{ color: palette.muted }}>{inst.fullName}</p>
      </header>

      {/* Scoring visualizer */}
      <section className="mb-10">
        <p className="text-[10.5px] tracking-[0.16em] uppercase mb-4" style={{ color: palette.muted }}>Scoring bands</p>
        <SeveritySpectrum instrument={inst} height={48} />
      </section>

      {/* Items */}
      <section className="mb-10">
        <p className="text-[10.5px] tracking-[0.16em] uppercase mb-4" style={{ color: palette.muted }}>Items ({inst.items.length})</p>
        <ol className="space-y-4">
          {inst.items.map((it, i) => (
            <li key={it.id} className="rounded-2xl border p-4" style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.55)" }}>
              <div className="flex items-start gap-3">
                <span className="tabular-nums text-[12px] mt-0.5 w-5 shrink-0" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] leading-snug" style={{ color: palette.ink }}>{it.prompt}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {it.scale.map((s) => (
                      <span key={s.value} className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: "rgba(234,223,226,0.5)", color: palette.muted }}>
                        <span className="tabular-nums" style={{ color: palette.ink }}>{s.value}</span> · {s.label}
                      </span>
                    ))}
                  </div>
                  {(inst.scoring.criticalItems ?? []).includes(it.id) && (
                    <p className="mt-2 text-[10.5px] tracking-[0.12em] uppercase" style={{ color: "#B0567A" }}>Critical item · auto-flag</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Population norms */}
      {norms && (
        <section className="mb-10">
          <div className="rounded-3xl border p-5" style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.55)" }}>
            <p className="text-[10.5px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Your practice · {norms.n} results</p>
            <div className="mt-3 flex items-baseline gap-4 flex-wrap">
              <div>
                <span className="tabular-nums text-[28px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{norms.median}</span>
                <span className="text-[11px] ml-2 tracking-[0.12em] uppercase" style={{ color: palette.muted }}>median score</span>
              </div>
              <div className="flex-1 min-w-[280px] flex gap-1.5">
                {norms.bands.map(([label, n]) => (
                  <div key={label} className="flex-1">
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(30,20,24,0.35)", opacity: 0.2 + Math.min(0.8, n / (norms.n || 1)) }} />
                    <p className="text-[9.5px] tracking-[0.1em] uppercase mt-1 truncate" style={{ color: palette.muted }}>{label} · {n}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => toast("Assign from Assignments → Assign new")} className="inline-flex items-center gap-1.5 text-[12px] px-4 h-10 rounded-full" style={{ background: palette.primary, color: "#fff" }}>
          <UserPlus className="w-3.5 h-3.5" /> Assign to patient
        </button>
        <button onClick={() => toast("Preview flow lives at /assessments/take/$id")} className="inline-flex items-center gap-1.5 text-[12px] px-4 h-10 rounded-full border" style={{ borderColor: palette.border, color: palette.ink, background: "rgba(255,255,255,0.5)" }}>
          <Eye className="w-3.5 h-3.5" /> Preview as patient
        </button>
        <button onClick={duplicate} className="inline-flex items-center gap-1.5 text-[12px] px-4 h-10 rounded-full border" style={{ borderColor: palette.border, color: palette.ink, background: "rgba(255,255,255,0.5)" }}>
          <Copy className="w-3.5 h-3.5" /> Duplicate as custom
        </button>
      </div>
    </div>
  );
}
