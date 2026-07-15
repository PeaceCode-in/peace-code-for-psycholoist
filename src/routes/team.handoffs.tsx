import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { Card, SectionTitle, Avatar, InlineButton, EmptyState } from "@/components/practice/team/primitives";
import {
  useHandoffs, useMembers, useMe, createHandoff, respondHandoff,
  fmtRelDay, type Handoff,
} from "@/lib/team-store";
import { ArrowRightLeft, Plus, Check, X, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/team/handoffs")({
  head: () => ({ meta: [{ title: "Handoffs — Team" }] }),
  component: HandoffsPage,
});

function HandoffsPage() {
  const handoffs = useHandoffs();
  const me = useMe();
  const [open, setOpen] = useState(false);

  const pending = handoffs.filter((h) => h.status === "pending");
  const active = handoffs.filter((h) => h.status === "accepted");
  const closed = handoffs.filter((h) => h.status === "completed" || h.status === "declined" || h.status === "cancelled");

  const inbound = pending.filter((h) => h.toId === me.id);
  const outbound = pending.filter((h) => h.fromId === me.id);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <div>
          <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Case sharing</div>
          <h2 className="text-[20px] mt-1 tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            Nothing changes hands without ceremony
          </h2>
          <p className="text-[12.5px] mt-1 max-w-xl" style={{ color: palette.muted }}>
            Every share is scoped, timed, and requires the receiver to accept. Continuity of care stays intact.
          </p>
        </div>
        <InlineButton tone="rose" onClick={() => setOpen(true)}><Plus className="w-3 h-3" /> New handoff</InlineButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <SectionTitle eyebrow="Inbound" title={`${inbound.length} awaiting your acceptance`} />
          {inbound.length === 0 && <EmptyState icon={ArrowRightLeft} title="No one is passing you a case" />}
          <ul className="space-y-2">
            {inbound.map((h) => <HandoffRow key={h.id} h={h} showAccept />)}
          </ul>
        </Card>
        <Card className="p-4">
          <SectionTitle eyebrow="Outbound" title={`${outbound.length} pending your colleagues`} />
          {outbound.length === 0 && <EmptyState icon={ArrowRightLeft} title="You haven't passed a case recently" />}
          <ul className="space-y-2">
            {outbound.map((h) => <HandoffRow key={h.id} h={h} />)}
          </ul>
        </Card>
      </div>

      <Card className="p-4">
        <SectionTitle eyebrow="In effect" title={`${active.length} active shares`} hint="Currently sharing continuity between clinicians." />
        {active.length === 0 && <EmptyState icon={ArrowRightLeft} title="No active shares" />}
        <ul className="space-y-2">
          {active.map((h) => <HandoffRow key={h.id} h={h} />)}
        </ul>
      </Card>

      <Card className="p-4">
        <SectionTitle eyebrow="Closed" title="Recent decisions" />
        {closed.length === 0 && <EmptyState icon={ArrowRightLeft} title="No closed handoffs yet" />}
        <ul className="space-y-1.5">
          {closed.slice(0, 10).map((h) => <HandoffRow key={h.id} h={h} dense />)}
        </ul>
      </Card>

      {open && <HandoffDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

function scopeList(h: Handoff) {
  return Object.entries(h.scope).filter(([, v]) => v).map(([k]) => k).join(" · ");
}

function HandoffRow({ h, showAccept = false, dense = false }: { h: Handoff; showAccept?: boolean; dense?: boolean }) {
  const members = useMembers();
  const me = useMe();
  const from = members.find((m) => m.id === h.fromId);
  const to = members.find((m) => m.id === h.toId);

  if (dense) {
    return (
      <li className="flex items-center gap-3 text-[11.5px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span style={{ color: palette.muted }}>{new Date(h.createdAt).toLocaleDateString([], { day: "numeric", month: "short" })}</span>
        <span className="flex-1 truncate" style={{ color: palette.ink }}>{h.patientName}</span>
        <span style={{ color: palette.muted }}>{from?.preferredName ?? from?.fullName ?? "—"} → {to?.preferredName ?? to?.fullName ?? "—"}</span>
        <span className="uppercase text-[10px] tracking-[0.18em]" style={{ color: h.status === "declined" ? "#8B4A6A" : palette.muted }}>{h.status}</span>
      </li>
    );
  }

  return (
    <li className="rounded-xl p-3" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <div className="text-[13.5px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{h.patientName}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px]" style={{ color: palette.muted }}>
            {from && <span className="inline-flex items-center gap-1.5"><Avatar member={from} size={18} /> {from.preferredName ?? from.fullName}</span>}
            <ArrowRightLeft className="w-3 h-3" />
            {to && <span className="inline-flex items-center gap-1.5"><Avatar member={to} size={18} /> {to.preferredName ?? to.fullName}</span>}
          </div>
          <div className="mt-2 text-[11.5px]" style={{ color: palette.ink }}>{h.reason}</div>
          {h.note && <div className="mt-1 text-[11.5px] italic" style={{ color: palette.muted }}>"{h.note}"</div>}
        </div>
        <div className="text-right shrink-0">
          <div className="uppercase text-[9.5px] tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            {h.kind === "temporary-share" ? "Temp share" : "Transfer"}
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            {fmtRelDay(h.startsAt)}{h.endsAt ? ` → ${fmtRelDay(h.endsAt)}` : ""}
          </div>
          <div className="mt-1 text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>scope · {scopeList(h)}</div>
        </div>
      </div>
      {showAccept && h.status === "pending" && (
        <div className="mt-3 flex justify-end gap-2">
          <InlineButton tone="ghost" onClick={() => respondHandoff(h.id, "declined", me)}><X className="w-3 h-3" /> Decline</InlineButton>
          <InlineButton tone="rose" onClick={() => respondHandoff(h.id, "accepted", me)}><Check className="w-3 h-3" /> Accept handoff</InlineButton>
        </div>
      )}
    </li>
  );
}

function HandoffDialog({ onClose }: { onClose: () => void }) {
  const members = useMembers();
  const me = useMe();
  const eligible = members.filter((m) => m.id !== me.id && (m.role === "clinician" || m.role === "supervisor" || m.role === "associate" || m.role === "owner"));
  const [step, setStep] = useState<1 | 2>(1);
  const [patientName, setPatientName] = useState("");
  const [toId, setToId] = useState(eligible[0]?.id ?? "");
  const [kind, setKind] = useState<Handoff["kind"]>("temporary-share");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 10));
  const [endsAt, setEndsAt] = useState(new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [scope, setScope] = useState({ notes: true, assessments: true, billing: false, schedule: true });

  const to = members.find((m) => m.id === toId);
  const canProceed = patientName.trim() && toId && reason.trim();

  const submit = () => {
    createHandoff({
      patientId: `pat_${patientName.toLowerCase().replace(/\s+/g, "_")}`,
      patientName,
      fromId: me.id,
      toId,
      kind,
      scope,
      startsAt: new Date(startsAt).getTime(),
      endsAt: kind === "temporary-share" ? new Date(endsAt).getTime() : undefined,
      reason,
      note,
    }, me);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center px-3" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-lg rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Step {step} of 2</div>
        <h3 className="text-[18px] mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          {step === 1 ? "What are you handing over?" : "Confirm the handoff"}
        </h3>

        {step === 1 ? (
          <div className="mt-3 space-y-3">
            <Field label="Patient name">
              <input value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full h-9 px-3 rounded-lg text-[13px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }} />
            </Field>
            <Field label="Passing to">
              <select value={toId} onChange={(e) => setToId(e.target.value)} className="w-full h-9 px-3 rounded-lg text-[13px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}>
                {eligible.map((m) => <option key={m.id} value={m.id}>{m.fullName} · {m.role}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setKind("temporary-share")}
                className="rounded-xl p-3 text-left transition-colors"
                style={{ background: kind === "temporary-share" ? palette.soft : palette.surface2, border: `1px solid ${kind === "temporary-share" ? palette.primary : palette.border}` }}
              >
                <div className="text-[12.5px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>Temporary share</div>
                <div className="text-[10.5px] mt-0.5" style={{ color: palette.muted }}>Cover for a defined window. Returns to you.</div>
              </button>
              <button
                onClick={() => setKind("permanent-transfer")}
                className="rounded-xl p-3 text-left transition-colors"
                style={{ background: kind === "permanent-transfer" ? palette.soft : palette.surface2, border: `1px solid ${kind === "permanent-transfer" ? palette.primary : palette.border}` }}
              >
                <div className="text-[12.5px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>Permanent transfer</div>
                <div className="text-[10.5px] mt-0.5" style={{ color: palette.muted }}>Full ownership moves to your colleague.</div>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Starts">
                <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="w-full h-9 px-3 rounded-lg text-[13px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }} />
              </Field>
              {kind === "temporary-share" && (
                <Field label="Ends">
                  <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="w-full h-9 px-3 rounded-lg text-[13px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }} />
                </Field>
              )}
            </div>
            <Field label="Reason">
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this being handed over?" className="w-full h-9 px-3 rounded-lg text-[13px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }} />
            </Field>
            <Field label="Handoff note">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What does the receiver need to know before session one?" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-y" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }} />
            </Field>
            <Field label="Scope of access">
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(scope) as (keyof typeof scope)[]).map((k) => (
                  <label key={k} className="flex items-center gap-2 text-[12px]" style={{ color: palette.ink }}>
                    <input type="checkbox" checked={scope[k]} onChange={(e) => setScope({ ...scope, [k]: e.target.checked })} />
                    {k}
                  </label>
                ))}
              </div>
            </Field>
          </div>
        ) : (
          <div className="mt-3 rounded-xl p-3" style={{ background: "#FFF7FA", border: `1px solid ${palette.soft}` }}>
            <div className="flex items-center gap-2 mb-2 text-[12px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>
              <ShieldAlert className="w-3.5 h-3.5" style={{ color: palette.primary }} /> Patient care is changing hands. Read this carefully.
            </div>
            <dl className="grid grid-cols-3 gap-y-1 text-[11.5px]">
              <dt style={{ color: palette.muted }}>Patient</dt><dd className="col-span-2" style={{ color: palette.ink }}>{patientName}</dd>
              <dt style={{ color: palette.muted }}>To</dt><dd className="col-span-2" style={{ color: palette.ink }}>{to?.fullName}</dd>
              <dt style={{ color: palette.muted }}>Kind</dt><dd className="col-span-2" style={{ color: palette.ink }}>{kind === "temporary-share" ? "Temporary share" : "Permanent transfer"}</dd>
              <dt style={{ color: palette.muted }}>Window</dt><dd className="col-span-2" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{startsAt}{kind === "temporary-share" ? ` → ${endsAt}` : " (indefinite)"}</dd>
              <dt style={{ color: palette.muted }}>Scope</dt><dd className="col-span-2" style={{ color: palette.ink }}>{Object.entries(scope).filter(([, v]) => v).map(([k]) => k).join(" · ")}</dd>
              <dt style={{ color: palette.muted }}>Reason</dt><dd className="col-span-2" style={{ color: palette.ink }}>{reason}</dd>
            </dl>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <InlineButton tone="ghost" onClick={onClose}>Cancel</InlineButton>
          <div className="flex gap-2">
            {step === 2 && <InlineButton tone="ghost" onClick={() => setStep(1)}>Back</InlineButton>}
            {step === 1 ? (
              <InlineButton tone="ink" onClick={() => setStep(2)} disabled={!canProceed}>Review</InlineButton>
            ) : (
              <InlineButton tone="rose" onClick={submit}>Confirm handoff</InlineButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
