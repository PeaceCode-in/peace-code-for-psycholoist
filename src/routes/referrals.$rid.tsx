import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Phone, Mail, CheckCircle2, XCircle, CalendarCheck, MessageSquare } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { getReferral, updateReferral, setStatus, useReferrals, SOURCE_LABEL, STATUS_LABEL, type ReferralStatus } from "@/lib/referrals-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/referrals/$rid")({
  loader: ({ params }) => {
    const r = getReferral(params.rid);
    if (!r) throw notFound();
    return { rid: params.rid };
  },
  component: ReferralDetail,
  notFoundComponent: () => <div className="p-8 text-[13px]" style={{ color: palette.muted }}>Referral not found.</div>,
});

function ReferralDetail() {
  const { rid } = Route.useParams();
  const hydrated = useHydrated();
  useReferrals();
  const r = getReferral(rid);
  const [notes, setNotes] = useState(r?.notes ?? "");

  if (!hydrated) return null;
  if (!r) return null;

  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 pb-16">
      <Link to="/referrals" className="inline-flex items-center gap-1 text-[11px] mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <ArrowLeft className="h-3 w-3" /> All referrals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="rounded-2xl border p-6" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <span>{r.direction} · {SOURCE_LABEL[r.source]}</span>
              <span>{STATUS_LABEL[r.status]}</span>
            </div>
            <h1 className="mt-2 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{r.patientName}</h1>
            <div className="text-[12px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Initials {r.patientInitials} · urgency: {r.urgency}</div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Presenting</div>
              <p className="text-[14px] whitespace-pre-wrap leading-relaxed" style={{ color: palette.ink }}>{r.presenting}</p>
            </div>

            {r.outboundReason && (
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Reason for outbound referral</div>
                <p className="text-[13px]" style={{ color: palette.ink }}>{r.outboundReason}</p>
              </div>
            )}

            <div className="mt-5 pt-4 border-t grid grid-cols-2 md:grid-cols-3 gap-3 text-[12px]" style={{ borderColor: palette.border }}>
              <Meta label="Received" value={new Date(r.receivedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
              {r.firstContactAt && <Meta label="First contact" value={new Date(r.firstContactAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />}
              {r.scheduledAt && <Meta label="Scheduled" value={new Date(r.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />}
              {r.convertedAt && <Meta label="Converted" value={new Date(r.convertedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />}
              {r.convertedPatientId && <Meta label="Chart" value={r.convertedPatientId} />}
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Working notes</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => updateReferral(r.id, { notes }, "notes edited")} rows={5} className="w-full border rounded-xl px-3 py-2 text-[13px]" style={{ borderColor: palette.border }} />
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>History</div>
            <div className="space-y-1.5">
              {r.history.map((h, i) => (
                <div key={i} className="grid grid-cols-[120px_100px_1fr] gap-3 text-[12px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <span style={{ color: palette.muted }}>{new Date(h.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                  <span style={{ color: palette.muted }}>{h.who}</span>
                  <span style={{ color: palette.ink }}>{h.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Actions</div>
            <div className="space-y-2">
              {r.direction === "incoming" && r.status === "new" && (
                <ActionBtn icon={<MessageSquare className="h-3.5 w-3.5" />} label="Mark contacted" onClick={() => setStatus(r.id, "contacted")} />
              )}
              {r.direction === "incoming" && (r.status === "new" || r.status === "contacted") && (
                <ActionBtn icon={<CalendarCheck className="h-3.5 w-3.5" />} label="Mark scheduled" onClick={() => setStatus(r.id, "scheduled")} />
              )}
              {r.direction === "incoming" && r.status !== "converted" && r.status !== "declined" && (
                <ActionBtn icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Convert to patient" onClick={() => { const pid = `p_${r.patientInitials.toLowerCase().replace(/\./g, "")}`; setStatus(r.id, "converted"); updateReferral(r.id, { convertedPatientId: pid }, `chart ${pid} created`); }} />
              )}
              {r.status !== "declined" && r.status !== "converted" && (
                <ActionBtn icon={<XCircle className="h-3.5 w-3.5" />} label="Decline with warm referrals" onClick={() => setStatus(r.id, "declined")} tone="danger" />
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Contact</div>
            {r.sourceContact && <ContactRow icon={<Mail className="h-3.5 w-3.5" />} value={r.sourceContact} label="Source" />}
            {r.patientContact && <ContactRow icon={<Phone className="h-3.5 w-3.5" />} value={r.patientContact} label="Patient" />}
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Change status</div>
            <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value as ReferralStatus)} className="w-full border rounded-lg px-2 py-1.5 text-[12px]" style={{ borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              {(Object.keys(STATUS_LABEL) as ReferralStatus[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-0.5" style={{ color: palette.ink }}>{value}</div>
    </div>
  );
}
function ActionBtn({ icon, label, onClick, tone }: { icon: React.ReactNode; label: string; onClick: () => void; tone?: "danger" }) {
  return (
    <button onClick={onClick} className="w-full inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] hover:bg-black/[0.02] transition-colors" style={{ borderColor: palette.border, color: tone === "danger" ? "#B85A3E" : palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      {icon} {label}
    </button>
  );
}
function ContactRow({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-[12px]" style={{ color: palette.ink }}>
      <span style={{ color: palette.muted }}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
        <div className="truncate" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{value}</div>
      </div>
    </div>
  );
}
