import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, Copy, MessageCircle, Trash2, Send } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveAssignment, markReviewed, markCompleteOnBehalf, extendDeadline, retireAssignment,
  addThreadMessage, addSubmission,
} from "@/lib/homework-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/homework/$hid")({
  component: HomeworkDetail,
});

function HomeworkDetail() {
  const { hid } = Route.useParams();
  const hydrated = useHydrated();
  const a = useLiveAssignment(hid);
  const navigate = useNavigate();
  const [reviewNote, setReviewNote] = useState("");
  const [msg, setMsg] = useState("");

  if (!hydrated) return null;
  if (!a) return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-[13px]" style={{ color: palette.muted }}>Assignment not found.</p>
      <Link to="/homework" className="text-[12px] underline mt-3 inline-block" style={{ color: palette.ink }}>Back to homework</Link>
    </div>
  );
  const p = getPatient(a.patientId);
  const tpl = a.templateSnapshot;
  const overdue = a.status === "missed";
  const isReview = a.status === "completed";

  function doExtend() {
    const raw = window.prompt("Extend deadline to (YYYY-MM-DD):", new Date(a!.dueAt + 7 * 86400_000).toISOString().slice(0, 10));
    if (!raw) return;
    const ts = new Date(raw + "T20:00:00").getTime();
    if (isNaN(ts)) return;
    extendDeadline(a!.id, ts);
  }
  function doRetire() {
    if (!window.confirm("Retire this assignment? It will be removed from the list.")) return;
    retireAssignment(a!.id);
    navigate({ to: "/homework" });
  }
  function doReview() {
    markReviewed(a!.id, reviewNote || undefined);
    setReviewNote("");
  }
  function sendMsg() {
    if (!msg.trim()) return;
    addThreadMessage(a!.id, "clinician", msg.trim());
    setMsg("");
  }
  function simulateSubmission() {
    // Dev/demo helper: creates a placeholder submission so the review round-trip is testable.
    const values: Record<string, string | number> = {};
    for (const f of tpl.fields) {
      if (f.type === "scale") values[f.key] = 4;
      else values[f.key] = "Reflection recorded.";
    }
    addSubmission(a!.id, values, "Submitted by patient.");
  }

  // Mood sparkline (for daily recurring diary-card / mood templates)
  const moodField = tpl.fields.find((f) => f.key === "emotion" || f.key === "before" || f.key === "quality");
  const moodSeries = moodField ? a.submissions.map((s) => Number(s.values[moodField.key] ?? 0)) : [];

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <Link to="/homework" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-4" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) 320px" }}>
        <div className="rounded-3xl border p-6 lg:p-8" style={{ borderColor: palette.border, background: palette.glassStrong }}>
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {tpl.modality} · assigned {new Date(a.assignedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </div>
              <h2 className="text-[24px] leading-tight tracking-tight mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{tpl.name}</h2>
              <div className="text-[12px] mt-1" style={{ color: palette.muted }}>For {p?.fullName ?? "patient"} · due {new Date(a.dueAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} {overdue && <span style={{ color: "#B0567A" }}>· overdue</span>}</div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full capitalize" style={{ background: palette.soft, color: palette.primary, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{a.status.replace("_", " ")}</span>
          </div>

          <div className="mt-6">
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Instructions</div>
            <p className="text-[13.5px] leading-relaxed" style={{ color: palette.ink }}>{a.instructions}</p>
            {a.reflectionPrompt && (
              <p className="text-[12.5px] mt-2 italic" style={{ color: palette.muted }}>Reflection: {a.reflectionPrompt}</p>
            )}
          </div>

          {moodSeries.length > 3 && (
            <div className="mt-6">
              <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                Trend · last {moodSeries.length} entries
              </div>
              <Sparkline data={moodSeries} />
            </div>
          )}

          <div className="mt-8">
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Submissions · {a.submissions.length}</div>
            {a.submissions.length === 0 ? (
              <div className="rounded-xl border border-dashed p-5 text-center text-[12.5px]" style={{ borderColor: palette.border, color: palette.muted }}>
                Nothing submitted yet.
                <button onClick={simulateSubmission} className="ml-2 text-[11.5px] underline" style={{ color: palette.ink }}>Simulate submission</button>
              </div>
            ) : (
              <ul className="space-y-3">
                {a.submissions.slice().reverse().map((s) => (
                  <li key={s.id} className="rounded-xl border p-4" style={{ borderColor: palette.border, background: palette.solid }}>
                    <div className="text-[11px] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{new Date(s.at).toLocaleString("en-IN")}</div>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                      {tpl.fields.map((f) => {
                        const v = s.values[f.key];
                        const display = Array.isArray(v) ? v.join(", ") : String(v ?? "—");
                        return (
                          <div key={f.key}>
                            <div className="text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{f.label}</div>
                            <div className="text-[12.5px]" style={{ color: palette.ink }}>{display || "—"}</div>
                          </div>
                        );
                      })}
                    </div>
                    {s.note && <div className="mt-2 text-[12px] italic" style={{ color: palette.muted }}>"{s.note}"</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isReview && (
            <div className="mt-6 rounded-xl border p-4" style={{ borderColor: palette.border, background: "rgba(239,228,240,0.35)" }}>
              <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Clinician review</div>
              <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} placeholder="Feedback to the patient…" className="w-full rounded-xl border p-3 text-[13px] outline-none bg-white" style={{ borderColor: palette.border, color: palette.ink }} />
              <div className="mt-2 flex justify-end">
                <button onClick={doReview} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark reviewed
                </button>
              </div>
            </div>
          )}

          {a.reviewerNote && (
            <div className="mt-4 rounded-xl border p-3 text-[12.5px]" style={{ borderColor: palette.border, background: "#F4F1EB", color: palette.ink }}>
              <span style={{ color: palette.muted }}>Reviewed {a.reviewedAt ? new Date(a.reviewedAt).toLocaleDateString("en-IN") : ""}: </span>{a.reviewerNote}
            </div>
          )}

          <div className="mt-8">
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              Thread · {a.thread.length}
            </div>
            <ul className="space-y-2 mb-3">
              {a.thread.map((m) => (
                <li key={m.id} className={`rounded-xl px-3 py-2 text-[12.5px] max-w-[80%] ${m.from === "clinician" ? "ml-auto" : ""}`}
                  style={{ background: m.from === "clinician" ? palette.ink : "#fff", color: m.from === "clinician" ? "#fff" : palette.ink, border: `1px solid ${palette.border}` }}>
                  <div className="text-[10px] mb-0.5 opacity-70" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{m.from} · {new Date(m.at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                  {m.body}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()} placeholder="Send a quick note…" className="flex-1 h-10 px-3 rounded-full border text-[12.5px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
              <button onClick={sendMsg} className="grid place-items-center h-10 w-10 rounded-full" style={{ background: palette.ink, color: "#fff" }}>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <aside>
          <div className="rounded-2xl border p-4 sticky top-6" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Actions</div>
            <div className="grid gap-2">
              <button onClick={doExtend} className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-[12.5px] text-left" style={{ borderColor: palette.border, color: palette.ink }}>
                <CalendarClock className="h-3.5 w-3.5" /> Extend deadline
              </button>
              <button onClick={() => markCompleteOnBehalf(a!.id)} className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-[12.5px] text-left" style={{ borderColor: palette.border, color: palette.ink }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark complete on behalf
              </button>
              <Link to="/homework/assign" className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-[12.5px] text-left" style={{ borderColor: palette.border, color: palette.ink }}>
                <Copy className="h-3.5 w-3.5" /> Duplicate for another patient
              </Link>
              <button onClick={doRetire} className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-[12.5px] text-left" style={{ borderColor: palette.border, color: "#8A2E4E" }}>
                <Trash2 className="h-3.5 w-3.5" /> Retire assignment
              </button>
            </div>
            <div className="mt-6 text-[11.5px]" style={{ color: palette.muted }}>
              Template: <span style={{ color: palette.ink }}>{tpl.name}</span><br />
              Recurrence: <span style={{ color: palette.ink }}>{a.recurrence}</span><br />
              Modality: <span style={{ color: palette.ink }}>{tpl.modality}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 320; const h = 48;
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="max-w-full">
      <polyline fill="none" stroke={palette.primary} strokeWidth="1.5" points={points} />
      {data.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - ((v - min) / range) * h} r="1.6" fill={palette.primary} />
      ))}
    </svg>
  );
}
