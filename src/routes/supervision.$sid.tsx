import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { getSession, updateSession, markAttended, useSessions } from "@/lib/supervision-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/supervision/$sid")({
  loader: ({ params }) => {
    const s = getSession(params.sid, "supervisee");
    if (!s) throw notFound();
    return { sid: params.sid };
  },
  component: SessionDetail,
  notFoundComponent: () => <div className="p-8 text-[13px]" style={{ color: palette.muted }}>Session not found.</div>,
});

function SessionDetail() {
  const { sid } = Route.useParams();
  const hydrated = useHydrated();
  useSessions(); // subscribe
  const s = getSession(sid, "supervisee");

  const [shared, setShared] = useState(s?.sharedNotes ?? "");
  const [priv, setPriv] = useState(s?.privateNotesBySupervisee ?? "");

  useEffect(() => { setShared(s?.sharedNotes ?? ""); setPriv(s?.privateNotesBySupervisee ?? ""); /* eslint-disable-next-line */ }, [sid]);

  if (!hydrated) return null;
  if (!s) return <div className="p-8 text-[13px]" style={{ color: palette.muted }}>Session not found.</div>;

  const past = s.status !== "upcoming";

  return (
    <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16">
      <Link to="/supervision" className="inline-flex items-center gap-1 text-[11px] mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <ArrowLeft className="h-3 w-3" /> Sessions
      </Link>

      <div className="rounded-2xl border p-6 mb-4" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <span>Supervision session · {s.role}</span>
          <span>{s.status.replace("_", " ")}</span>
        </div>
        <h1 className="mt-2 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          {new Date(s.scheduledAt).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </h1>
        <div className="text-[12px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          {new Date(s.scheduledAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} · {s.durationMin} min · with {s.supervisorName}
        </div>

        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Agenda</div>
          <p className="text-[14px] whitespace-pre-wrap" style={{ color: palette.ink }}>{s.agenda}</p>
        </div>

        {s.cases.length > 0 && (
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Cases discussed</div>
            <div className="flex flex-wrap gap-2">
              {s.cases.map((c, i) => (
                <span key={i} className="text-[12px] rounded-full border px-2.5 py-0.5" style={{ borderColor: palette.border, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  {c.patientInitials}{c.focus ? ` — ${c.focus}` : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {!past && (
          <div className="mt-5 pt-4 border-t flex items-center gap-2" style={{ borderColor: palette.border }}>
            <button onClick={() => markAttended(s.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark attended · push {s.hoursForCpd}h to CPD
            </button>
            <button onClick={() => updateSession(s.id, { status: "cancelled" })} className="text-[12px] px-3 py-1.5" style={{ color: palette.muted }}>Cancel session</button>
          </div>
        )}
        {past && s.cpdEntryId && (
          <div className="mt-5 pt-4 border-t text-[11px] inline-flex items-center gap-1.5" style={{ borderColor: palette.border, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified · {s.hoursForCpd}h added to CPD ledger ({s.cpdEntryId})
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-5 mb-4" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Shared notes — visible to both</div>
        <textarea value={shared} onChange={(e) => setShared(e.target.value)} onBlur={() => updateSession(s.id, { sharedNotes: shared })} rows={6} placeholder="Working record. Discussed, agreed, action items." className="w-full border rounded-xl px-3 py-2 text-[13px]" style={{ borderColor: palette.border }} />
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(203,108,84,0.35)", background: "rgba(255,247,244,0.7)", backdropFilter: "blur(14px)" }}>
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <Lock className="h-3.5 w-3.5" /> Your private reflection — supervisor cannot see
        </div>
        <textarea value={priv} onChange={(e) => setPriv(e.target.value)} onBlur={() => updateSession(s.id, { privateNotesBySupervisee: priv })} rows={6} placeholder="Personal reflection. Feelings, parallel process, questions for personal therapy." className="w-full border rounded-xl px-3 py-2 text-[13px] bg-white/60" style={{ borderColor: palette.border }} />
        <p className="mt-2 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          Enforced at the store layer. Even a supervisor accessing this session cannot query this field.
        </p>
      </div>
    </div>
  );
}
