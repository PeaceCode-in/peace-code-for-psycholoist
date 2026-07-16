import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, Trash2, Sparkles } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { usePlan, addPlanItem, togglePlanDone, removePlanItem, CATEGORY_LABEL, type CpdCategory } from "@/lib/cpd-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/cpd/plan")({
  component: CpdPlan,
});

const SUGGESTIONS = [
  "You've logged 2 trauma-focused entries recently. A 3rd could round out the trauma track — consider Sangath's trauma-informed group work in the catalog.",
  "Your ethics hours are at 4 of 5 required. One workshop closes it.",
  "Two active AN cases and only 20h CBT-E so far. A supervised case consultation would be a natural next step.",
];

function CpdPlan() {
  const hydrated = useHydrated();
  const items = usePlan();
  const [goal, setGoal] = useState("");
  const [cat, setCat] = useState<CpdCategory>("clinical");
  const [target, setTarget] = useState(5);

  function submit() {
    if (!goal.trim()) return;
    addPlanItem({ goal: goal.trim(), category: cat, target });
    setGoal(""); setTarget(5);
  }

  if (!hydrated) return null;

  return (
    <div className="max-w-[960px] mx-auto px-5 sm:px-8 pb-16 space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 24 }}>Learning plan</h2>
        <p className="text-[12px] mt-1" style={{ color: palette.muted }}>Annual goals you set for yourself. Questions Co-Pilot might ask, never prescribe.</p>
      </div>

      <section className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <Sparkles className="h-3 w-3" /> Gentle nudges
        </div>
        <ul className="space-y-2">
          {SUGGESTIONS.map((s, i) => (
            <li key={i} className="text-[13px] rounded-lg border px-3 py-2" style={{ borderColor: palette.border, background: "#F9F5F0", color: palette.ink, fontFamily: "'Fraunces', serif", lineHeight: 1.55 }}>
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
        <h3 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 18 }}>Your goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_100px_auto] gap-2 mt-3">
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Deepen ACT for chronic pain" className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: palette.solid }} />
          <select value={cat} onChange={(e) => setCat(e.target.value as CpdCategory)} className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: palette.solid }}>
            {(Object.keys(CATEGORY_LABEL) as CpdCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
          <input type="number" min={1} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: palette.solid }} placeholder="hours" />
          <button onClick={submit} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}><Plus className="h-3.5 w-3.5" />Add</button>
        </div>
        <ul className="mt-4 divide-y" style={{ borderColor: palette.border }}>
          {items.map((p) => (
            <li key={p.id} className="flex items-baseline justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <button onClick={() => togglePlanDone(p.id)} className="w-4 h-4 rounded border inline-flex items-center justify-center" style={{ borderColor: palette.border, background: p.done ? palette.ink : "transparent" }}>
                    {p.done && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <span style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 15, textDecoration: p.done ? "line-through" : "none" }}>{p.goal}</span>
                </div>
                <div className="text-[11px] mt-1 ml-6" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{CATEGORY_LABEL[p.category]} · target {p.target}h</div>
                {p.notes && <div className="text-[12px] mt-1 ml-6" style={{ color: palette.muted }}>{p.notes}</div>}
              </div>
              <button onClick={() => removePlanItem(p.id)} className="text-[11px]" style={{ color: palette.muted }}><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          ))}
          {items.length === 0 && <li className="py-6 text-center text-[13px]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>No goals yet. Even one is a plan.</li>}
        </ul>
      </section>
    </div>
  );
}
