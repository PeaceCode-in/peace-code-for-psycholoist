import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ClipboardList, FileText, MessagesSquare, Target, PenSquare,
  Lock, GitBranch, Sparkles, Video, Check, Shield, ChevronRight, Clock,
} from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveConference, useLiveAudit, REASON_META,
  addDiscussionPost, setRecommendations, signOff, lockConference, updateConference,
  amendConference, draftCaseSummary,
  type DiscussionPost, type Recommendations,
} from "@/lib/conferences-store";
import { getPatient } from "@/lib/patients-store";
import { getMember } from "@/lib/team-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/case-conferences/$cid")({
  head: () => ({ meta: [{ title: "Conference — PeaceCode · Practice" }] }),
  component: ConferenceDetail,
});

type Tab = "overview" | "summary" | "discussion" | "recommendations" | "signoff";

const TABS: Array<{ key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "overview", label: "Overview", icon: ClipboardList },
  { key: "summary", label: "Case summary", icon: FileText },
  { key: "discussion", label: "Discussion", icon: MessagesSquare },
  { key: "recommendations", label: "Recommendations", icon: Target },
  { key: "signoff", label: "Sign-off", icon: PenSquare },
];

const me = "me";

function ConferenceDetail() {
  const hydrated = useHydrated();
  const { cid } = Route.useParams();
  const c = useLiveConference(cid);
  const audit = useLiveAudit(cid);
  const [tab, setTab] = useState<Tab>("overview");

  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading…</div>;
  if (!c) return (
    <div className="max-w-[900px] mx-auto px-8 py-20 text-center">
      <p className="text-[14px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Conference not found.</p>
      <Link to="/case-conferences" className="mt-4 inline-flex items-center gap-1.5 text-[12px]" style={{ color: palette.primary }}>
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>
    </div>
  );

  const patient = c.patientId ? getPatient(c.patientId) : undefined;
  const label = c.anonymized && patient
    ? `${patient.fullName.split(" ").map((n) => n[0]).join("")} · ${patient.age}${patient.pronouns.startsWith("she") ? "F" : patient.pronouns.startsWith("he") ? "M" : "NB"}`
    : (patient?.fullName ?? "Unnamed peer case");
  const reason = REASON_META[c.reason];
  const isLocked = c.status === "closed";
  const lead = c.participants.find((p) => p.role === "lead");
  const iAmLead = lead?.memberId === me;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-24">
      <Link to="/case-conferences" className="inline-flex items-center gap-1.5 text-[11.5px] mt-1 mb-3" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Back to conferences
      </Link>

      <div className="rounded-3xl border p-6 mb-5" style={{ borderColor: palette.border, background: palette.glassStrong }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: reason.tone, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{reason.label}</span>
              {c.anonymized && <><span style={{ color: palette.muted }}>·</span><span className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wider" style={{ color: palette.muted }}><Shield className="h-3 w-3" /> anonymized</span></>}
              <span style={{ color: palette.muted }}>·</span>
              <span className="text-[11.5px]" style={{ color: palette.muted }}>{new Date(c.scheduledAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              {isLocked && <><span style={{ color: palette.muted }}>·</span><span className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: palette.ink }}><Lock className="h-3 w-3" /> locked</span></>}
            </div>
            <h1 className="text-[22px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{label}</h1>
            <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: palette.muted }}>{c.presenting}</p>
          </div>
          {c.videoLink && !isLocked && (
            <a href={c.videoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
              <Video className="h-3.5 w-3.5" /> Join
            </a>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5 border-t pt-4" style={{ borderColor: palette.border }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-[11.5px]"
                style={{ background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview" && <OverviewTab c={c} />}
      {tab === "summary" && <SummaryTab c={c} isLocked={isLocked} />}
      {tab === "discussion" && <DiscussionTab c={c} isLocked={isLocked} />}
      {tab === "recommendations" && <RecommendationsTab c={c} isLocked={isLocked} />}
      {tab === "signoff" && <SignOffTab c={c} isLocked={isLocked} iAmLead={iAmLead} />}

      {isLocked && c.amendments.length > 0 && (
        <div className="mt-5 rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.lavender + "60" }}>
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="h-3.5 w-3.5" style={{ color: palette.primary }} />
            <span className="text-[11.5px] uppercase tracking-wider" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.ink }}>Amendments ({c.amendments.length})</span>
          </div>
          <div className="space-y-3">
            {c.amendments.map((a) => {
              const author = getMember(a.authorId);
              return (
                <div key={a.id} className="rounded-xl border p-3" style={{ borderColor: palette.border, background: palette.solid }}>
                  <div className="text-[11.5px]" style={{ color: palette.muted }}>{author?.fullName} · {new Date(a.at).toLocaleString("en-IN")}</div>
                  <div className="text-[12.5px] mt-1" style={{ color: palette.ink }}>{a.reason}</div>
                  <p className="text-[12px] mt-2 whitespace-pre-wrap" style={{ color: palette.muted }}>{a.patch}</p>
                  <div className="text-[10px] mt-2 font-mono" style={{ color: palette.muted }}>{a.hash}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLocked && iAmLead && <AmendPanel cid={c.id} />}

      <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glass }}>
        <div className="text-[10.5px] uppercase tracking-wider mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Audit trail · {audit.length} events</div>
        <div className="max-h-40 overflow-auto space-y-1">
          {audit.slice().reverse().slice(0, 12).map((e) => (
            <div key={e.id} className="text-[11px] flex items-center gap-2" style={{ color: palette.muted }}>
              <span className="font-mono">{new Date(e.at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              <span>·</span>
              <span>{e.action}</span>
              <span>·</span>
              <span>{getMember(e.by)?.preferredName ?? e.by}</span>
              {e.note && <><span>·</span><span>{e.note}</span></>}
            </div>
          ))}
        </div>
      </div>

      {c.followUpConferenceId && (
        <FollowUpBanner id={c.followUpConferenceId} />
      )}
    </div>
  );
}

function OverviewTab({ c }: { c: ReturnType<typeof useLiveConference> & object }) {
  const nav = useNavigate();
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Panel title="Facilitator">
        <MemberRow id={c.facilitatorId} role="facilitator" />
      </Panel>
      <Panel title="Format">
        <div className="text-[13px]" style={{ color: palette.ink }}>{c.format} · {c.durationMin} min</div>
        {c.videoLink && <div className="text-[11.5px] mt-1 font-mono truncate" style={{ color: palette.muted }}>{c.videoLink}</div>}
      </Panel>
      <Panel title={`Participants (${c.participants.length})`}>
        <div className="space-y-2">
          {c.participants.map((p) => <MemberRow key={p.memberId} id={p.memberId} role={p.role} responded={!!p.respondedAt} />)}
        </div>
      </Panel>
      <Panel title="Scheduling">
        <div className="text-[13px]" style={{ color: palette.ink }}>{new Date(c.scheduledAt).toLocaleString("en-IN", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}</div>
        <div className="text-[11.5px] mt-1 capitalize" style={{ color: palette.muted }}>Urgency · {c.urgency}</div>
      </Panel>
      {c.patientId && (
        <Panel title="Patient record">
          <button onClick={() => nav({ to: "/patients/$pid" as string, params: { pid: c.patientId! } } as never)}
            className="inline-flex items-center gap-1 text-[12.5px]" style={{ color: palette.primary }}>
            Open patient <ChevronRight className="h-3 w-3" />
          </button>
        </Panel>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong }}>
      <div className="text-[10.5px] uppercase tracking-wider mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{title}</div>
      {children}
    </div>
  );
}

function MemberRow({ id, role, responded }: { id: string; role: string; responded?: boolean }) {
  const m = getMember(id);
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full text-[10px] text-white" style={{ background: m?.tone ?? palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{m?.avatarInitials ?? "??"}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px]" style={{ color: palette.ink }}>{m?.fullName ?? "Unknown"}</div>
        <div className="text-[11px] capitalize" style={{ color: palette.muted }}>{role}{responded === false ? " · pending" : ""}</div>
      </div>
    </div>
  );
}

function SummaryTab({ c, isLocked }: { c: NonNullable<ReturnType<typeof useLiveConference>>; isLocked: boolean }) {
  const [text, setText] = useState(c.caseSummary);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setText(c.caseSummary); setDirty(false); }, [c.id, c.caseSummary]);

  const regenerate = () => {
    const draft = draftCaseSummary(c.patientId, c.anonymized);
    setText(draft); setDirty(true);
  };
  const save = () => {
    updateConference(c.id, { caseSummary: text, summaryReviewedBy: me });
    setDirty(false);
  };

  return (
    <div className="rounded-3xl border p-6" style={{ borderColor: palette.border, background: palette.glassStrong }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" style={{ color: palette.primary }} />
          <span className="text-[11px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Case summary · Co-Pilot draft</span>
        </div>
        {!isLocked && (
          <div className="flex items-center gap-2">
            <button onClick={regenerate} className="h-8 px-3 rounded-full border text-[11.5px]" style={{ borderColor: palette.border, color: palette.muted }}>
              Regenerate draft
            </button>
            {dirty && <button onClick={save} className="h-8 px-3 rounded-full text-[11.5px]" style={{ background: palette.ink, color: "#fff" }}>Save</button>}
          </div>
        )}
      </div>
      {isLocked ? (
        <p className="text-[13px] whitespace-pre-wrap leading-relaxed" style={{ color: palette.ink }}>{c.caseSummary}</p>
      ) : (
        <textarea value={text} onChange={(e) => { setText(e.target.value); setDirty(true); }}
          rows={14} className="w-full p-3 rounded-xl border text-[13px] outline-none leading-relaxed"
          style={{ borderColor: palette.border, background: palette.solid, color: palette.ink, fontFamily: "'DM Sans', sans-serif" }} />
      )}
      {c.summaryReviewedBy && !isLocked && (
        <div className="mt-3 text-[11px]" style={{ color: palette.muted }}>Reviewed by {getMember(c.summaryReviewedBy)?.fullName}. Never sent without lead review.</div>
      )}
    </div>
  );
}

function DiscussionTab({ c, isLocked }: { c: NonNullable<ReturnType<typeof useLiveConference>>; isLocked: boolean }) {
  const [body, setBody] = useState("");
  const [phase, setPhase] = useState<DiscussionPost["phase"]>("pre");

  const grouped = useMemo(() => {
    const g: Record<DiscussionPost["phase"], DiscussionPost[]> = { pre: [], during: [], post: [] };
    c.discussion.forEach((p) => g[p.phase].push(p));
    return g;
  }, [c.discussion]);

  const post = () => {
    if (!body.trim()) return;
    addDiscussionPost(c.id, me, body.trim(), phase);
    setBody("");
  };

  return (
    <div className="space-y-4">
      {(["pre","during","post"] as const).map((ph) => (
        <div key={ph} className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong }}>
          <div className="text-[10.5px] uppercase tracking-wider mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{ph === "pre" ? "Before conference" : ph === "during" ? "During conference" : "After conference"} · {grouped[ph].length}</div>
          {grouped[ph].length === 0 ? (
            <div className="text-[12px]" style={{ color: palette.muted }}>Nothing here yet.</div>
          ) : (
            <div className="space-y-3">
              {grouped[ph].map((p) => {
                const a = getMember(p.authorId);
                return (
                  <div key={p.id} className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full text-[10px] text-white" style={{ background: a?.tone ?? palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{a?.avatarInitials ?? "??"}</span>
                    <div className="flex-1">
                      <div className="text-[11.5px]" style={{ color: palette.muted }}>{a?.fullName} · {new Date(p.at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                      <p className="text-[13px] mt-1 leading-relaxed" style={{ color: palette.ink }}>{p.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {!isLocked && (
        <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong }}>
          <div className="flex items-center gap-2 mb-3">
            {(["pre","during","post"] as const).map((ph) => (
              <button key={ph} onClick={() => setPhase(ph)} className="h-7 px-3 rounded-full border text-[11px] uppercase tracking-wider"
                style={{ borderColor: phase === ph ? palette.ink : palette.border, background: phase === ph ? palette.ink : "transparent", color: phase === ph ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{ph}</button>
            ))}
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3}
            placeholder="Draft your post. This is not live chat — everyone sees it once you post."
            className="w-full p-3 rounded-xl border text-[13px] outline-none"
            style={{ borderColor: palette.border, background: palette.solid, color: palette.ink, fontFamily: "'DM Sans', sans-serif" }} />
          <div className="mt-3 flex justify-end">
            <button onClick={post} disabled={!body.trim()} className="h-9 px-4 rounded-full text-[12px] disabled:opacity-40" style={{ background: palette.ink, color: "#fff" }}>Post</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationsTab({ c, isLocked }: { c: NonNullable<ReturnType<typeof useLiveConference>>; isLocked: boolean }) {
  const [rec, setRec] = useState<Recommendations>(c.recommendations);
  const [followUp, setFollowUp] = useState<string>(() => rec.followUpAt ? new Date(rec.followUpAt).toISOString().slice(0, 10) : "");
  useEffect(() => { setRec(c.recommendations); setFollowUp(c.recommendations.followUpAt ? new Date(c.recommendations.followUpAt).toISOString().slice(0, 10) : ""); }, [c.id, c.recommendations]);

  const fields: Array<{ key: keyof Recommendations; label: string; hint: string }> = [
    { key: "diagnostic", label: "Diagnostic impressions", hint: "Reformulation, differential, comorbidities noticed." },
    { key: "treatmentChanges", label: "Treatment plan changes", hint: "Modality pivots, frequency changes, technique shifts." },
    { key: "medications", label: "Medication considerations", hint: "Psychiatrist input only. Leave blank if not applicable." },
    { key: "riskPlan", label: "Risk plan changes", hint: "Additions, monitoring cadence, escalation triggers." },
    { key: "referrals", label: "Referrals to make", hint: "Specialists, allied care, community resources." },
  ];

  const save = () => {
    setRecommendations(c.id, { ...rec, followUpAt: followUp ? new Date(followUp).getTime() : undefined });
  };

  return (
    <div className="rounded-3xl border p-6" style={{ borderColor: palette.border, background: palette.glassStrong }}>
      <div className="space-y-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-[11px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{f.label}</label>
            <div className="text-[11px] mb-1.5" style={{ color: palette.muted }}>{f.hint}</div>
            {isLocked ? (
              <p className="text-[13px] whitespace-pre-wrap leading-relaxed" style={{ color: palette.ink }}>{(rec[f.key] as string) || "—"}</p>
            ) : (
              <textarea value={rec[f.key] as string ?? ""} onChange={(e) => setRec((r) => ({ ...r, [f.key]: e.target.value }))} rows={3}
                className="w-full p-3 rounded-xl border text-[13px] outline-none"
                style={{ borderColor: palette.border, background: palette.solid, color: palette.ink, fontFamily: "'DM Sans', sans-serif" }} />
            )}
          </div>
        ))}

        <div>
          <label className="text-[11px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Follow-up review date</label>
          <div className="text-[11px] mb-1.5" style={{ color: palette.muted }}>Auto-scheduled 4–6 weeks out on lock.</div>
          {isLocked ? (
            <p className="text-[13px]" style={{ color: palette.ink }}>{followUp ? new Date(followUp).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "None"}</p>
          ) : (
            <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
              className="h-10 px-3 rounded-xl border text-[13px]" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
          )}
        </div>

        {!isLocked && (
          <div className="flex justify-end">
            <button onClick={save} className="h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>Save recommendations</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SignOffTab({ c, isLocked, iAmLead }: { c: NonNullable<ReturnType<typeof useLiveConference>>; isLocked: boolean; iAmLead: boolean }) {
  const signed = new Set(c.signOffs.map((s) => s.memberId));
  const allSigned = c.participants.every((p) => signed.has(p.memberId));
  const iAmParticipant = c.participants.some((p) => p.memberId === me);

  return (
    <div className="rounded-3xl border p-6" style={{ borderColor: palette.border, background: palette.glassStrong }}>
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Sign-off · {c.signOffs.length} / {c.participants.length}</div>
        <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>Each participant confirms they were part of this discussion and agree with the recorded outcome. Lead locks the record.</p>
      </div>
      <div className="space-y-2">
        {c.participants.map((p) => {
          const m = getMember(p.memberId);
          const sig = c.signOffs.find((s) => s.memberId === p.memberId);
          const isMe = p.memberId === me;
          return (
            <div key={p.memberId} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: palette.border, background: sig ? palette.surface2 : "#fff" }}>
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full text-[10.5px] text-white" style={{ background: m?.tone ?? palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{m?.avatarInitials ?? "??"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px]" style={{ color: palette.ink }}>{m?.fullName}</div>
                <div className="text-[11px] capitalize" style={{ color: palette.muted }}>{p.role}{sig ? ` · signed ${new Date(sig.at).toLocaleDateString("en-IN")}` : ""}</div>
              </div>
              {sig ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: "#E4EFE0", color: "#3E6A2E", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <Check className="h-3 w-3" /> signed
                </span>
              ) : isMe && !isLocked ? (
                <button onClick={() => signOff(c.id, me)} className="h-8 px-3 rounded-full text-[11.5px]" style={{ background: palette.ink, color: "#fff" }}>Sign</button>
              ) : (
                <span className="text-[10.5px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>pending</span>
              )}
            </div>
          );
        })}
      </div>

      {!isLocked && iAmLead && (
        <div className="mt-5 pt-4 border-t flex items-center justify-between gap-3" style={{ borderColor: palette.border }}>
          <div className="text-[11.5px]" style={{ color: palette.muted }}>
            {allSigned ? "All signed. Lock the record to freeze the outcome." : "Waiting on remaining sign-offs. Lead can still lock — unsigned participants show as absent."}
          </div>
          <button onClick={() => lockConference(c.id, me)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px]" style={{ background: palette.primary, color: "#fff" }}>
            <Lock className="h-3.5 w-3.5" /> Lock record
          </button>
        </div>
      )}

      {isLocked && (
        <div className="mt-5 pt-4 border-t text-[11.5px]" style={{ borderColor: palette.border, color: palette.muted }}>
          Locked {c.lockedAt && new Date(c.lockedAt).toLocaleString("en-IN")} by {getMember(c.lockedBy ?? "")?.fullName ?? "—"}. Post-lock edits require an Amendment.
        </div>
      )}
      {!iAmParticipant && !isLocked && (
        <div className="mt-4 text-[11.5px]" style={{ color: palette.muted }}>You&apos;re not on this conference&apos;s participant list.</div>
      )}
    </div>
  );
}

function AmendPanel({ cid }: { cid: string }) {
  const [reason, setReason] = useState("");
  const [patch, setPatch] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glass }}>
      {!open ? (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: palette.primary }}>
          <GitBranch className="h-3.5 w-3.5" /> Add amendment
        </button>
      ) : (
        <div>
          <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>New amendment</div>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for amendment"
            className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none mb-2"
            style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
          <textarea value={patch} onChange={(e) => setPatch(e.target.value)} rows={3} placeholder="What is being added or corrected"
            className="w-full p-3 rounded-xl border text-[13px] outline-none"
            style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => { setOpen(false); setReason(""); setPatch(""); }} className="h-9 px-3 rounded-full text-[12px]" style={{ color: palette.muted }}>Cancel</button>
            <button disabled={!reason.trim() || !patch.trim()} onClick={() => { amendConference(cid, me, reason.trim(), patch.trim()); setOpen(false); setReason(""); setPatch(""); }}
              className="h-9 px-4 rounded-full text-[12px] disabled:opacity-40" style={{ background: palette.ink, color: "#fff" }}>Save amendment</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FollowUpBanner({ id }: { id: string }) {
  const f = useLiveConference(id);
  if (!f) return null;
  return (
    <div className="mt-5 rounded-2xl border p-4 flex items-center justify-between gap-3" style={{ borderColor: palette.border, background: palette.soft + "40" }}>
      <div className="flex items-center gap-2.5">
        <Clock className="h-3.5 w-3.5" style={{ color: palette.primary }} />
        <div>
          <div className="text-[12.5px]" style={{ color: palette.ink }}>Follow-up scheduled</div>
          <div className="text-[11.5px]" style={{ color: palette.muted }}>{new Date(f.scheduledAt).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}</div>
        </div>
      </div>
      <Link to="/case-conferences/$cid" params={{ cid: id }} className="inline-flex items-center gap-1 text-[11.5px]" style={{ color: palette.primary }}>
        Open <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
