import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { Card, SectionTitle, Avatar, InlineButton, Metric, EmptyState } from "@/components/practice/team/primitives";
import {
  useMembers, useMe, useSupervisions, listSupervisionSessions, logSupervisionSession,
  fmtRelDay,
} from "@/lib/team-store";
import { GraduationCap, Clock, Flag, ClipboardCheck, Lock } from "lucide-react";

export const Route = createFileRoute("/team/supervision")({
  head: () => ({ meta: [{ title: "Supervision — Team" }] }),
  component: SupervisionPage,
});

function SupervisionPage() {
  const me = useMe();
  const members = useMembers();
  const supervisions = useSupervisions();
  const mine = supervisions.filter((s) => s.supervisorId === me.id);
  const asSupervisee = supervisions.filter((s) => s.superviseeId === me.id);
  const totalCosigns = mine.reduce((a, s) => a + s.pendingCosigns, 0);
  const totalFlagged = mine.reduce((a, s) => a + s.flaggedCases, 0);
  const hoursThisMonth = mine.reduce((a, s) => a + s.hoursLoggedMonth, 0);

  return (
    <div className="space-y-5">
      {/* The desk — one focal queue */}
      <Card className="p-5" style={{ background: "linear-gradient(180deg, rgba(255,247,250,0.9), rgba(255,255,255,0.72))" }}>
        <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Waiting on you</div>
        <h2 className="text-[22px] mt-1 tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          {totalCosigns} co-signs · {totalFlagged} flagged {totalCosigns + totalFlagged === 0 ? "· all clear" : ""}
        </h2>
        <p className="text-[12.5px] mt-1 max-w-lg" style={{ color: palette.muted }}>
          Notes from your supervisees waiting for your signature, plus cases they've flagged for review.
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label="Supervisees" value={mine.length} />
          <Metric label="Hours this month" value={hoursThisMonth.toFixed(1)} unit="h" />
          <Metric label="Pending co-signs" value={totalCosigns} tone={totalCosigns > 0 ? "#B08444" : undefined} />
          <Metric label="Flagged cases" value={totalFlagged} tone={totalFlagged > 0 ? palette.primary : undefined} />
        </div>
      </Card>

      {mine.length > 0 && (
        <Card>
          <div className="p-4 border-b" style={{ borderColor: palette.border }}>
            <SectionTitle eyebrow="Supervisees" title="Your desk of learners" hint="Each row is a supervision relationship. Click through to their profile." />
          </div>
          <ul className="divide-y" style={{ borderColor: palette.border }}>
            {mine.map((sv) => {
              const s = members.find((m) => m.id === sv.superviseeId);
              if (!s) return null;
              const behindHours = sv.hoursLoggedMonth < sv.hoursRequiredMonth;
              return (
                <li key={sv.id} className="grid grid-cols-12 items-center gap-3 p-4">
                  <Link to="/team/$id" params={{ id: s.id }} className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                    <Avatar member={s} size={38} />
                    <div className="min-w-0">
                      <div className="text-[13.5px] tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{s.fullName}</div>
                      <div className="text-[10.5px] mt-0.5 truncate" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                        {s.credentials}
                      </div>
                    </div>
                  </Link>
                  <div className="col-span-6 md:col-span-2">
                    <div className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Cadence</div>
                    <div className="text-[12px] mt-0.5" style={{ color: palette.ink }}>{sv.frequency}</div>
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <div className="text-[9.5px] uppercase tracking-[0.18em] flex justify-between" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      <span>Hours</span>
                      <span style={{ color: behindHours ? "#B08444" : "#1F7A3E" }}>
                        {sv.hoursLoggedMonth.toFixed(1)} / {sv.hoursRequiredMonth}h
                      </span>
                    </div>
                    <div className="w-full h-1.5 mt-1.5 rounded-full overflow-hidden" style={{ background: palette.border }}>
                      <div style={{ width: `${Math.min(100, (sv.hoursLoggedMonth / sv.hoursRequiredMonth) * 100)}%`, height: "100%", background: behindHours ? "#D4A24C" : palette.primary }} />
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-2 flex items-center gap-3 text-[11.5px]" style={{ color: palette.muted }}>
                    <span className="inline-flex items-center gap-1"><ClipboardCheck className="w-3 h-3" style={{ color: sv.pendingCosigns > 0 ? "#B08444" : palette.muted }} /> {sv.pendingCosigns}</span>
                    <span className="inline-flex items-center gap-1"><Flag className="w-3 h-3" style={{ color: sv.flaggedCases > 0 ? palette.primary : palette.muted }} /> {sv.flaggedCases}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtRelDay(sv.nextSessionAt)}</span>
                  </div>
                  <div className="col-span-6 md:col-span-1 text-right">
                    <LogSessionButton supervisionId={sv.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {asSupervisee.length > 0 && (
        <Card className="p-4">
          <SectionTitle eyebrow="You" title="Your own supervision" />
          <ul className="space-y-2">
            {asSupervisee.map((sv) => {
              const sup = members.find((m) => m.id === sv.supervisorId);
              if (!sup) return null;
              return (
                <li key={sv.id} className="flex items-center gap-3">
                  <Avatar member={sup} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px]" style={{ color: palette.ink }}>{sup.fullName}</div>
                    <div className="text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {sv.frequency} · {sv.hoursLoggedMonth.toFixed(1)}h / {sv.hoursRequiredMonth}h this month
                    </div>
                  </div>
                  <div className="text-[11.5px]" style={{ color: palette.muted }}>next {fmtRelDay(sv.nextSessionAt)}</div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <SupervisionLog />

      {mine.length === 0 && asSupervisee.length === 0 && (
        <Card className="p-6">
          <EmptyState icon={GraduationCap} title="No supervision loops assigned to you" hint="Set up supervisor–supervisee relationships in a member's profile." />
        </Card>
      )}
    </div>
  );
}

function LogSessionButton({ supervisionId }: { supervisionId: string }) {
  const me = useMe();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(60);
  const [note, setNote] = useState("");
  const submit = () => {
    logSupervisionSession({ supervisionId, at: Date.now(), durationMin: duration, privateNote: note, casesDiscussed: [] }, me);
    setOpen(false);
    setNote("");
  };
  if (!open) return <InlineButton tone="ink" onClick={() => setOpen(true)}>Log session</InlineButton>;
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center px-3" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-md rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Private supervision note</div>
        <h3 className="text-[16px] mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Log a supervision session</h3>
        <p className="text-[11.5px] mt-1" style={{ color: palette.muted }}>
          <Lock className="w-3 h-3 inline mr-1" /> Never shown on the patient chart. Visible only to the supervision pair.
        </p>
        <div className="mt-3 space-y-2">
          <label className="block">
            <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Duration (minutes)</span>
            <input
              type="number" min={5} max={240} step={5} value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 60)}
              className="w-full mt-1 h-9 px-3 rounded-lg text-[13px] outline-none"
              style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}
            />
          </label>
          <label className="block">
            <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Note</span>
            <textarea
              rows={5} value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was discussed? What was decided?"
              className="w-full mt-1 px-3 py-2 rounded-lg text-[13px] outline-none resize-y"
              style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <InlineButton tone="ghost" onClick={() => setOpen(false)}>Cancel</InlineButton>
          <InlineButton tone="rose" onClick={submit} disabled={!note.trim()}>Log session</InlineButton>
        </div>
      </div>
    </div>
  );
}

function SupervisionLog() {
  const me = useMe();
  const members = useMembers();
  const supervisions = useSupervisions();
  const all = listSupervisionSessions();
  const mine = all.filter((s) => {
    const sv = supervisions.find((x) => x.id === s.supervisionId);
    return sv && (sv.supervisorId === me.id || sv.superviseeId === me.id);
  }).slice(0, 8);

  return (
    <Card className="p-4">
      <SectionTitle eyebrow="Journal" title="Private supervision log" hint="Only the supervisor and supervisee in each pair can see these notes." />
      {mine.length === 0 && <EmptyState icon={Lock} title="No logged sessions yet" />}
      <ul className="space-y-3">
        {mine.map((s) => {
          const sv = supervisions.find((x) => x.id === s.supervisionId);
          if (!sv) return null;
          const other = members.find((m) => m.id === (sv.supervisorId === me.id ? sv.superviseeId : sv.supervisorId));
          if (!other) return null;
          return (
            <li key={s.id} className="flex gap-3">
              <Avatar member={other} size={30} />
              <div className="flex-1 min-w-0 rounded-xl p-3" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12.5px]" style={{ color: palette.ink }}>{other.fullName}</span>
                  <span className="text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    {new Date(s.at).toLocaleDateString([], { day: "numeric", month: "short" })} · {s.durationMin}m
                  </span>
                </div>
                <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: palette.ink }}>{s.privateNote}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
