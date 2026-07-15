import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { Card, SectionTitle, Avatar, InlineButton, EmptyState } from "@/components/practice/team/primitives";
import {
  useReferrals, useMembers, useMe, createReferral, respondReferral,
  type Referral,
} from "@/lib/team-store";
import { Share2, Plus, Check, X, Clock } from "lucide-react";

export const Route = createFileRoute("/team/referrals")({
  head: () => ({ meta: [{ title: "Internal referrals — Team" }] }),
  component: ReferralsPage,
});

const URGENCY_TONE: Record<Referral["urgency"], { bg: string; fg: string; label: string }> = {
  routine: { bg: "#F1E4EE", fg: "#8B4A6A", label: "Routine" },
  soon:    { bg: "#FFEFD6", fg: "#8A5A18", label: "Soon" },
  urgent:  { bg: "#F9D5D5", fg: "#B54848", label: "Urgent" },
};

function ReferralsPage() {
  const referrals = useReferrals();
  const me = useMe();
  const [open, setOpen] = useState(false);

  const inbound = referrals.filter((r) => r.toId === me.id && r.status === "pending");
  const outbound = referrals.filter((r) => r.fromId === me.id && r.status === "pending");
  const decided = referrals.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <div>
          <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Internal referrals</div>
          <h2 className="text-[20px] mt-1 tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            The right patient, the right clinician
          </h2>
          <p className="text-[12.5px] mt-1 max-w-lg" style={{ color: palette.muted }}>
            Route new intakes and existing patients to a colleague better matched — with reason, urgency, and their accept.
          </p>
        </div>
        <InlineButton tone="rose" onClick={() => setOpen(true)}><Plus className="w-3 h-3" /> New referral</InlineButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <SectionTitle eyebrow="Inbound" title={`${inbound.length} awaiting you`} />
          {inbound.length === 0 && <EmptyState icon={Share2} title="Nothing routed to you" />}
          <ul className="space-y-2">
            {inbound.map((r) => <ReferralRow key={r.id} r={r} showAccept />)}
          </ul>
        </Card>
        <Card className="p-4">
          <SectionTitle eyebrow="Outbound" title={`${outbound.length} pending your colleagues`} />
          {outbound.length === 0 && <EmptyState icon={Share2} title="You haven't routed anyone recently" />}
          <ul className="space-y-2">
            {outbound.map((r) => <ReferralRow key={r.id} r={r} />)}
          </ul>
        </Card>
      </div>

      <Card className="p-4">
        <SectionTitle eyebrow="Recently decided" title={`${decided.length} accepted or declined`} />
        {decided.length === 0 && <EmptyState icon={Share2} title="No history yet" />}
        <ul className="space-y-1.5">
          {decided.slice(0, 12).map((r) => <ReferralRow key={r.id} r={r} dense />)}
        </ul>
      </Card>

      {open && <ReferralDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

function ReferralRow({ r, showAccept = false, dense = false }: { r: Referral; showAccept?: boolean; dense?: boolean }) {
  const members = useMembers();
  const me = useMe();
  const from = members.find((m) => m.id === r.fromId);
  const to = members.find((m) => m.id === r.toId);
  const u = URGENCY_TONE[r.urgency];
  const [note, setNote] = useState("");

  if (dense) {
    return (
      <li className="grid grid-cols-12 gap-3 items-center text-[11.5px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span className="col-span-2" style={{ color: palette.muted }}>{new Date(r.createdAt).toLocaleDateString([], { day: "numeric", month: "short" })}</span>
        <span className="col-span-4 truncate" style={{ color: palette.ink }}>{r.patientName}</span>
        <span className="col-span-4 truncate" style={{ color: palette.muted }}>{from?.preferredName ?? "—"} → {to?.preferredName ?? "—"}</span>
        <span className="col-span-2 text-right uppercase text-[10px] tracking-[0.18em]" style={{ color: r.status === "declined" ? "#8B4A6A" : "#1F7A3E" }}>{r.status}</span>
      </li>
    );
  }

  return (
    <li className="rounded-xl p-3" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{r.patientName}</span>
            <span className="inline-flex items-center gap-1 h-[20px] px-2 rounded-full text-[10px]" style={{ background: u.bg, color: u.fg }}>
              {r.urgency === "urgent" && <Clock className="w-2.5 h-2.5" />}
              {u.label}
            </span>
          </div>
          <div className="mt-1 text-[11px]" style={{ color: palette.muted }}>
            {from && <span className="inline-flex items-center gap-1"><Avatar member={from} size={16} /> {from.preferredName ?? from.fullName}</span>}
            <span className="mx-1.5">→</span>
            {to && <span className="inline-flex items-center gap-1"><Avatar member={to} size={16} /> {to.preferredName ?? to.fullName}</span>}
          </div>
          <div className="mt-2 text-[11.5px]" style={{ color: palette.ink }}>{r.concern}</div>
          <div className="mt-0.5 text-[11px] italic" style={{ color: palette.muted }}>{r.reason}</div>
          {r.note && <div className="mt-1 text-[11px]" style={{ color: palette.muted }}>Note: {r.note}</div>}
        </div>
      </div>
      {showAccept && r.status === "pending" && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note back to referrer"
            className="flex-1 min-w-[200px] h-8 px-3 rounded-lg text-[12px] outline-none"
            style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}
          />
          <InlineButton tone="ghost" onClick={() => respondReferral(r.id, "declined", note, me)}><X className="w-3 h-3" /> Decline</InlineButton>
          <InlineButton tone="rose" onClick={() => respondReferral(r.id, "accepted", note, me)}><Check className="w-3 h-3" /> Accept referral</InlineButton>
        </div>
      )}
    </li>
  );
}

function ReferralDialog({ onClose }: { onClose: () => void }) {
  const members = useMembers();
  const me = useMe();
  const eligible = members.filter((m) => m.id !== me.id && (m.role === "clinician" || m.role === "supervisor" || m.role === "associate" || m.role === "owner"));
  const [patientName, setPatientName] = useState("");
  const [toId, setToId] = useState(eligible[0]?.id ?? "");
  const [concern, setConcern] = useState("");
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState<Referral["urgency"]>("routine");

  const ok = patientName.trim() && toId && reason.trim() && concern.trim();
  const submit = () => {
    createReferral({ patientName, fromId: me.id, toId, reason, concern, urgency }, me);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center px-3" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-md rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>New internal referral</div>
        <h3 className="text-[18px] mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Route to a colleague</h3>
        <div className="mt-3 space-y-3">
          <Field label="Patient name">
            <input value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full h-9 px-3 rounded-lg text-[13px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }} />
          </Field>
          <Field label="Route to">
            <select value={toId} onChange={(e) => setToId(e.target.value)} className="w-full h-9 px-3 rounded-lg text-[13px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}>
              {eligible.map((m) => <option key={m.id} value={m.id}>{m.fullName} · {m.specialties.slice(0, 2).join(", ")}</option>)}
            </select>
          </Field>
          <Field label="Presenting concern">
            <input value={concern} onChange={(e) => setConcern(e.target.value)} placeholder="e.g. Contamination OCD, ERP indicated" className="w-full h-9 px-3 rounded-lg text-[13px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }} />
          </Field>
          <Field label="Why this colleague?">
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Specialty match, language, availability…" className="w-full h-9 px-3 rounded-lg text-[13px] outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }} />
          </Field>
          <Field label="Urgency">
            <div className="flex gap-1.5">
              {(["routine", "soon", "urgent"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className="h-8 px-3 rounded-full text-[11.5px]"
                  style={{
                    background: urgency === u ? URGENCY_TONE[u].fg : "transparent",
                    color: urgency === u ? "#fff" : URGENCY_TONE[u].fg,
                    border: `1px solid ${URGENCY_TONE[u].fg}`,
                  }}
                >
                  {URGENCY_TONE[u].label}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <InlineButton tone="ghost" onClick={onClose}>Cancel</InlineButton>
          <InlineButton tone="rose" onClick={submit} disabled={!ok}>Send referral</InlineButton>
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
