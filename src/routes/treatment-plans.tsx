import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { SemicolonMark, EthicsRibbon, AiDraftTag, CopilotPanel, ShimmerText, ProvenancePopover } from "@/components/practice/copilot/primitives";
import { listPatients } from "@/lib/patients-store";
import { generateInterventions, useDrafts } from "@/lib/copilot-store";

export const Route = createFileRoute("/treatment-plans")({
  head: () => ({ meta: [
    { title: "Treatment plans — PeaceCode · Practice" },
    { name: "description", content: "Goals, milestones, and evidence-based interventions per patient." },
  ]}),
  component: TreatmentPlansPage,
});

type Goal = { id: string; text: string; status: "open" | "progressing" | "met" };
type Intervention = { id: string; title: string; note: string };

function TreatmentPlansPage() {
  const patients = listPatients().slice(0, 6);
  const [activeId, setActiveId] = useState<string>(patients[0]?.id ?? "");
  const active = patients.find((p) => p.id === activeId);

  const [goals, setGoals] = useState<Goal[]>([
    { id: "g1", text: "Reduce PHQ-9 by ≥ 3 points over 8 weeks", status: "progressing" },
    { id: "g2", text: "Sleep onset < 30 min on ≥ 4 nights/week", status: "open" },
    { id: "g3", text: "Restart one social contact per week", status: "open" },
  ]);
  const [chosen, setChosen] = useState<Intervention[]>([
    { id: "iv-seed", title: "CBT · Sleep hygiene + stimulus control", note: "Wind-down window; bed for sleep only." },
  ]);

  const drafts = useDrafts();
  const suggestion = useMemo(() => drafts.find((d) => d.kind === "intervention" && d.patientId === activeId), [drafts, activeId]);

  function suggest() {
    if (!active) return;
    generateInterventions(active.id);
  }

  function adopt(id: string, title: string, note: string) {
    if (chosen.some((c) => c.id === id)) return;
    setChosen([...chosen, { id, title, note }]);
    toast.success("Added to plan as a draft.");
  }

  return (
    <AppShell crumb="Treatment plans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Treatment plans</div>
        <h1 className="mt-1 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Goals, milestones, and interventions.</h1>

        <div className="mt-6 grid md:grid-cols-[240px_1fr] gap-6">
          {/* Patient list */}
          <aside>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Patient</div>
            <ul className="space-y-1">
              {patients.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setActiveId(p.id)}
                    className="w-full text-left px-2 py-2 rounded-lg"
                    style={{ background: activeId === p.id ? palette.surface2 : "transparent" }}
                  >
                    <div className="text-[13px]" style={{ color: palette.ink }}>{p.preferredName ?? p.fullName}</div>
                    <div className="text-[10.5px] tracking-[0.12em] uppercase" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.primaryConcern.split(",")[0]}</div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main plan */}
          <main className="space-y-6">
            {active && (
              <>
                <section className="rounded-2xl border p-5" style={{ background: "#fff", borderColor: palette.border }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Goals</div>
                      <h2 className="mt-1 text-[18px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{active.preferredName ?? active.fullName}</h2>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {goals.map((g) => (
                      <li key={g.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: palette.surface2 }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: g.status === "met" ? "#1F7A3E" : g.status === "progressing" ? palette.primary : palette.muted }} />
                        <span className="text-[13px] flex-1" style={{ color: palette.ink }}>{g.text}</span>
                        <select
                          value={g.status}
                          onChange={(e) => setGoals(goals.map((x) => x.id === g.id ? { ...x, status: e.target.value as Goal["status"] } : x))}
                          className="text-[11px] px-2 h-7 rounded-md"
                          style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}
                        >
                          <option value="open">Open</option>
                          <option value="progressing">Progressing</option>
                          <option value="met">Met</option>
                        </select>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border p-5" style={{ background: "#fff", borderColor: palette.border }}>
                  <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>In the plan</div>
                  <ul className="space-y-2">
                    {chosen.map((c) => (
                      <li key={c.id} className="p-3 rounded-lg" style={{ background: palette.surface2 }}>
                        <div className="text-[13px]" style={{ color: palette.ink }}>{c.title}</div>
                        <div className="text-[12px] mt-0.5" style={{ color: palette.muted }}>{c.note}</div>
                      </li>
                    ))}
                    {chosen.length === 0 && <li className="text-[12px]" style={{ color: palette.muted }}>Nothing yet. Copilot has suggestions on the right.</li>}
                  </ul>
                </section>

                {/* Copilot intervention suggestions */}
                <CopilotPanel className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <SemicolonMark size={13} />
                      <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Copilot suggestions</span>
                      {suggestion && (
                        <ProvenancePopover prov={suggestion.provenance}><AiDraftTag /></ProvenancePopover>
                      )}
                    </div>
                    <button onClick={suggest} className="h-8 px-3 rounded-full text-[11.5px]" style={{ background: palette.ink, color: "#fff" }}>
                      {suggestion ? "Refresh" : "Suggest interventions"}
                    </button>
                  </div>
                  {!suggestion ? (
                    <p className="text-[12.5px]" style={{ color: palette.muted }}>Additive drafts, cited. You drag them into the plan when useful.</p>
                  ) : (
                    <ul className="space-y-3">
                      {suggestion.blocks.map((b) => (
                        <li key={b.id} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${palette.border}` }}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-[13px]" style={{ color: palette.ink }}>{b.label}</div>
                            <button
                              onClick={() => adopt(b.id, b.label, b.body.split("\n\nWhy:")[0])}
                              className="text-[11px] px-2 h-6 rounded-md"
                              style={{ background: palette.surface2, color: palette.ink, border: `1px solid ${palette.border}` }}
                            >
                              Add to plan
                            </button>
                          </div>
                          <p className="text-[12.5px] whitespace-pre-wrap" style={{ color: palette.muted }}>
                            <ShimmerText text={b.body} streaming={b.streaming} />
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CopilotPanel>
              </>
            )}
          </main>
        </div>
      </div>
      <EthicsRibbon />
    </AppShell>
  );
}
