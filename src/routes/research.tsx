import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, palette } from "@/components/practice/AppShell";
import { useStudies, joinStudy, withdrawStudy, advanceEnrollment, addCase, submitCase, type Study, type Discipline } from "@/lib/research-store";
import { FlaskConical, BookOpen, ShieldCheck, Users, Clock, IndianRupee, Plus, ArrowUpRight, Check } from "lucide-react";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research & studies — PeaceCode · Practice" },
      { name: "description", content: "Participate in and contribute to clinical studies." },
    ],
  }),
  component: ResearchPage,
});

type Tab = "recruiting" | "mine" | "all";

function ResearchPage() {
  const studies = useStudies();
  const [tab, setTab] = useState<Tab>("recruiting");
  const [discipline, setDiscipline] = useState<Discipline | "All">("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [caseLabel, setCaseLabel] = useState("");

  const disciplines: (Discipline | "All")[] = ["All", "CBT", "Trauma", "Adolescent", "Digital Health", "Neuropsych", "Group Therapy"];

  const filtered = useMemo(() => {
    return studies.filter((s) => {
      if (tab === "recruiting" && s.status !== "recruiting") return false;
      if (tab === "mine" && s.participation === "not_joined") return false;
      if (discipline !== "All" && s.discipline !== discipline) return false;
      return true;
    });
  }, [studies, tab, discipline]);

  const mine = studies.filter((s) => s.participation !== "not_joined");
  const totalSubmitted = mine.reduce((a, s) => a + (s.submittedCases?.filter((c) => c.status !== "draft").length ?? 0), 0);
  const acceptedCases = mine.reduce((a, s) => a + (s.submittedCases?.filter((c) => c.status === "accepted").length ?? 0), 0);
  const potentialINR = mine.reduce((a, s) => a + (s.compensation * (s.submittedCases?.filter((c) => c.status === "accepted").length ?? 0)), 0);

  return (
    <AppShell crumb="Research">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="uppercase text-[10.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Growth · Research</div>
          <h1 className="mt-1 text-[26px] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            Contribute to studies without leaving your practice
          </h1>
          <p className="text-[13px] mt-1 max-w-2xl" style={{ color: palette.muted }}>
            De-identified case data only. Every study lists its IRB, time commitment, and eligibility up front — you decide what to join, one case at a time.
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatBox icon={FlaskConical} label="Studies I'm in" value={String(mine.length)} />
          <StatBox icon={Users} label="Cases submitted" value={String(totalSubmitted)} />
          <StatBox icon={Check} label="Cases accepted" value={String(acceptedCases)} />
          <StatBox icon={IndianRupee} label="Earned to date" value={`₹${potentialINR.toLocaleString("en-IN")}`} />
        </div>

        {/* Tabs + filter */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between mb-4">
          <div className="inline-flex rounded-full p-0.5 shrink-0" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
            {(["recruiting", "mine", "all"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="text-[12px] h-8 px-3 rounded-full transition-colors"
                style={{ background: tab === t ? "#fff" : "transparent", color: tab === t ? palette.ink : palette.muted, boxShadow: tab === t ? "0 1px 2px rgba(30,20,24,0.05)" : "none" }}
              >{t === "recruiting" ? "Recruiting" : t === "mine" ? "My studies" : "All"}</button>
            ))}
          </div>
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value as Discipline | "All")}
            className="h-8 px-3 rounded-full text-[12px] outline-none"
            style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink }}
          >
            {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-2xl p-8 text-center text-[13px]" style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.muted }}>
              No studies match this filter.
            </div>
          )}
          {filtered.map((s) => (
            <StudyCard
              key={s.id}
              s={s}
              expanded={openId === s.id}
              caseLabel={caseLabel}
              onToggle={() => { setOpenId(openId === s.id ? null : s.id); setCaseLabel(""); }}
              onJoin={() => joinStudy(s.id)}
              onWithdraw={() => { if (confirm("Withdraw from this study? Submitted cases will remain with the researcher.")) withdrawStudy(s.id); }}
              onAdvance={() => advanceEnrollment(s.id)}
              onCaseChange={setCaseLabel}
              onAddCase={() => { if (!caseLabel.trim()) return; addCase(s.id, caseLabel.trim()); setCaseLabel(""); }}
              onSubmitCase={(cid) => submitCase(s.id, cid)}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function StudyCard({ s, expanded, caseLabel, onToggle, onJoin, onWithdraw, onAdvance, onCaseChange, onAddCase, onSubmitCase }: {
  s: Study; expanded: boolean; caseLabel: string;
  onToggle: () => void; onJoin: () => void; onWithdraw: () => void; onAdvance: () => void;
  onCaseChange: (v: string) => void; onAddCase: () => void; onSubmitCase: (cid: string) => void;
}) {
  const pct = Math.round((s.cases.enrolled / s.cases.needed) * 100);
  const daysLeft = Math.round((s.windowClosesAt - Date.now()) / 86_400_000);
  const partMeta = PARTICIPATION[s.participation];
  const statusMeta = STATUS[s.status];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[10.5px] px-2 h-5 rounded-full inline-flex items-center" style={{ background: statusMeta.bg, color: statusMeta.fg }}>{statusMeta.label}</span>
              <span className="text-[10.5px] px-2 h-5 rounded-full inline-flex items-center" style={{ background: palette.surface2, color: palette.muted }}>{s.discipline}</span>
              <span className="text-[10.5px] px-2 h-5 rounded-full inline-flex items-center" style={{ background: partMeta.bg, color: partMeta.fg }}>{partMeta.label}</span>
              {s.compensation > 0 && (
                <span className="text-[10.5px] px-2 h-5 rounded-full inline-flex items-center gap-1" style={{ background: "#EAF3EE", color: "#3F7A55" }}>
                  <IndianRupee className="w-3 h-3" /> ₹{s.compensation.toLocaleString("en-IN")} / case
                </span>
              )}
            </div>
            <div className="text-[15.5px] leading-snug" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{s.title}</div>
            <div className="text-[12px] mt-0.5" style={{ color: palette.muted }}>{s.pi} · {s.institution} · {s.irb}</div>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: palette.ink, opacity: 0.85 }}>{s.summary}</p>
          </div>
          <button onClick={onToggle} className="h-8 px-3 rounded-full text-[12px] inline-flex items-center gap-1.5 shrink-0" style={{ background: expanded ? palette.ink : palette.surface, color: expanded ? "#fff" : palette.ink, border: `1px solid ${expanded ? palette.ink : palette.border}` }}>
            {expanded ? "Hide details" : "View details"} <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniMeta icon={Users} label="Enrollment" value={`${s.cases.enrolled} / ${s.cases.needed}`} />
          <MiniMeta icon={Clock} label="Time" value={`${s.timeCommitmentHrs} hrs`} />
          <MiniMeta icon={ShieldCheck} label="Window" value={daysLeft > 0 ? `${daysLeft}d left` : "Closed"} />
          <MiniMeta icon={BookOpen} label="Cases uploaded" value={String(s.submittedCases?.length ?? 0)} />
        </div>

        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: palette.surface2 }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: palette.primary }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {s.participation === "not_joined" && s.status === "recruiting" && (
            <button onClick={onJoin} className="h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>Request to join</button>
          )}
          {s.participation === "screening" && (
            <button onClick={onAdvance} className="h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.primary, color: "#fff" }}>Confirm eligibility & enroll</button>
          )}
          {(s.participation === "enrolled" || s.participation === "collecting") && (
            <button onClick={onAdvance} className="h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.primary, color: "#fff" }}>
              <Plus className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Add a case
            </button>
          )}
          {s.participation !== "not_joined" && s.participation !== "submitted" && (
            <button onClick={onWithdraw} className="h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` }}>Withdraw</button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-0">
          <div className="rounded-xl p-4" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
            <div className="text-[11.5px] uppercase tracking-wider mb-2" style={{ color: palette.muted }}>Eligibility</div>
            <ul className="grid sm:grid-cols-2 gap-1.5">
              {s.eligibility.map((e) => (
                <li key={e} className="text-[12.5px] flex items-start gap-1.5" style={{ color: palette.ink }}>
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#3F7A55" }} /> {e}
                </li>
              ))}
            </ul>
          </div>

          {s.participation !== "not_joined" && (
            <div className="mt-4">
              <div className="text-[11.5px] uppercase tracking-wider mb-2" style={{ color: palette.muted }}>Your uploaded cases</div>
              <div className="space-y-2">
                {(s.submittedCases ?? []).length === 0 && (
                  <div className="text-[12.5px]" style={{ color: palette.muted }}>No cases yet.</div>
                )}
                {(s.submittedCases ?? []).map((c) => (
                  <div key={c.id} className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
                    <div className="min-w-0">
                      <div className="text-[13px]" style={{ color: palette.ink }}>{c.label}</div>
                      <div className="text-[11px]" style={{ color: palette.muted }}>Added {new Date(c.at).toLocaleDateString()} · {c.status}</div>
                    </div>
                    {c.status === "draft" && (
                      <button onClick={() => onSubmitCase(c.id)} className="h-8 px-3 rounded-full text-[12px]" style={{ background: palette.primary, color: "#fff" }}>Submit</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={caseLabel}
                  onChange={(e) => onCaseChange(e.target.value)}
                  placeholder="Case label (de-identified — e.g. 'Case #A11 · adult · GAD')"
                  className="flex-1 h-9 px-3 rounded-full text-[12.5px] outline-none"
                  style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink }}
                />
                <button onClick={onAddCase} className="h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>Add case</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider" style={{ color: palette.muted }}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="mt-2 text-[24px] tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</div>
    </div>
  );
}
function MiniMeta({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px]" style={{ color: palette.muted }}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}: <span style={{ color: palette.ink }}>{value}</span></span>
    </div>
  );
}

const STATUS: Record<Study["status"], { label: string; bg: string; fg: string }> = {
  recruiting: { label: "Recruiting", bg: "#EAF3EE", fg: "#3F7A55" },
  active:     { label: "Active",     bg: "#E8ECF6", fg: "#4A5C8A" },
  closed:     { label: "Closed",     bg: "#F1E4EE", fg: "#8B4A6A" },
};
const PARTICIPATION: Record<Study["participation"], { label: string; bg: string; fg: string }> = {
  not_joined:  { label: "Open to you",   bg: palette.surface2, fg: palette.muted },
  screening:   { label: "Screening",     bg: "#FFEFD6", fg: "#8A5A18" },
  enrolled:    { label: "Enrolled",      bg: "#EAF3EE", fg: "#3F7A55" },
  collecting:  { label: "Collecting",    bg: "#E8ECF6", fg: "#4A5C8A" },
  submitted:   { label: "Contributed",   bg: "#F1E4EE", fg: "#8B4A6A" },
  ineligible:  { label: "Ineligible",    bg: "#FDECEC", fg: "#B54848" },
};
