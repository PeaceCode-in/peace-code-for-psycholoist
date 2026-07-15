import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, NotebookPen, Feather, Sparkles, Check } from "lucide-react";
import { PortalShell, Card, Chip, portal } from "@/components/portal/PortalShell";
import { fmtDateWarm, saveHomeworkResponse, toggleHomeworkDone, useMyHomework } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/homework")({
  head: () => ({ meta: [{ title: "Between sessions" }, { name: "robots", content: "noindex" }] }),
  component: HomeworkPage,
});

const KIND_ICON = {
  journal: Feather,
  reading: BookOpen,
  worksheet: NotebookPen,
  practice: Sparkles,
} as const;

function HomeworkPage() {
  const homework = useMyHomework();
  const active = homework.filter(h => !h.done);
  const done = homework.filter(h => h.done);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const streakText = done.length === 0
    ? "Your first piece of homework is waiting — no rush."
    : `You've completed ${done.length} ${done.length === 1 ? "thing" : "things"} your therapist sent. That counts.`;

  return (
    <PortalShell title="Between sessions" subtitle={streakText}>
      <section className="mb-10">
        <h2 className="mb-3 text-[15px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>To do this week</h2>
        {active.length === 0 ? (
          <Card><p style={{ color: portal.muted }}>Nothing new to work on right now. Rest is part of the practice.</p></Card>
        ) : (
          <div className="flex flex-col gap-3">
            {active.map(h => {
              const Icon = KIND_ICON[h.kind];
              const open = expanded === h.id;
              return (
                <Card key={h.id}>
                  <div className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: portal.soft, color: portal.roseDeep }}>
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19 }}>{h.title}</h3>
                        {h.dueAt ? <span className="text-[13px]" style={{ color: portal.muted }}>due {fmtDateWarm(h.dueAt).toLowerCase()}</span> : null}
                      </div>
                      <p className="mt-2 text-[14px]" style={{ color: portal.ink }}>{h.prompt}</p>
                      {open ? (
                        <div className="mt-4">
                          <textarea
                            value={drafts[h.id] ?? h.response ?? ""}
                            onChange={e => setDrafts(d => ({ ...d, [h.id]: e.target.value }))}
                            placeholder="Write a reflection here. As much or as little as you want."
                            className="w-full rounded-xl border px-3 py-2 text-[14px] outline-none"
                            style={{ borderColor: portal.border, background: portal.paper, minHeight: 120 }}
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => { saveHomeworkResponse(h.id, drafts[h.id] ?? ""); setExpanded(null); }}
                              className="rounded-full px-3 py-1.5 text-[13px]"
                              style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}
                            >Save</button>
                            <button
                              onClick={() => { toggleHomeworkDone(h.id, drafts[h.id] ?? h.response); setExpanded(null); }}
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px]"
                              style={{ background: portal.rose, color: "#fff" }}
                            ><Check className="h-3.5 w-3.5" /> Mark done</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => setExpanded(h.id)} className="rounded-full px-3 py-1.5 text-[13px]" style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}>
                            Reflect
                          </button>
                          <button onClick={() => toggleHomeworkDone(h.id)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px]" style={{ background: portal.soft, color: portal.roseDeep }}>
                            <Check className="h-3.5 w-3.5" /> Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="mb-3 text-[15px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Completed</h2>
          <div className="flex flex-col gap-2">
            {done.map(h => (
              <div key={h.id} className="rounded-2xl p-4" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16 }}>{h.title}</p>
                    <p className="text-[13px]" style={{ color: portal.muted }}>{h.submittedAt ? fmtDateWarm(h.submittedAt) : "Marked done"}</p>
                    {h.response ? <p className="mt-2 text-[14px]">{h.response}</p> : null}
                  </div>
                  <button onClick={() => toggleHomeworkDone(h.id)} className="text-[12px]" style={{ color: portal.muted }}>Undo</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PortalShell>
  );
}
