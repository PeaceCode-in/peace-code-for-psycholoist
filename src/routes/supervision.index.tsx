import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, CalendarClock, ShieldCheck, ChevronRight, Lock } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useSessions, useContracts, totalHoursThisYear, nextSession, createSession, type SupervisionSession } from "@/lib/supervision-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/supervision/")({
  component: SupervisionHome,
});

function SupervisionHome() {
  const hydrated = useHydrated();
  const sessions = useSessions();
  const contracts = useContracts();
  const [showNew, setShowNew] = useState(false);

  const activeContract = contracts.find((c) => c.status === "active");
  const upcoming = sessions.filter((s) => s.status === "upcoming").sort((a, b) => a.scheduledAt - b.scheduledAt);
  const past = sessions.filter((s) => s.status !== "upcoming");
  const next = nextSession();
  const hours = totalHoursThisYear();

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Hours this year" value={hours.toFixed(1)} sub="pushed to CPD ledger" />
        <Stat label="Active contract" value={activeContract ? "1" : "0"} sub={activeContract ? "signed both sides" : "none active"} tone={activeContract ? "ok" : "warn"} />
        <Stat label="Next session" value={next ? new Date(next.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"} sub={next ? new Date(next.scheduledAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "not scheduled"} />
        <Stat label="Attended (all-time)" value={String(past.filter((s) => s.status === "attended").length)} sub="verified" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Upcoming</div>
            <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <Plus className="h-3.5 w-3.5" /> Log / schedule session
            </button>
          </div>
          {upcoming.length === 0 && <p className="text-[13px]" style={{ color: palette.muted }}>Nothing scheduled.</p>}
          {upcoming.map((s) => <SessionRow key={s.id} s={s} />)}

          <div className="text-[11px] uppercase tracking-[0.14em] pt-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>History</div>
          {past.map((s) => <SessionRow key={s.id} s={s} />)}
        </div>

        <div className="space-y-5">
          {activeContract && (
            <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <ShieldCheck className="h-3.5 w-3.5" /> Active contract
              </div>
              <div className="mt-2 text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{activeContract.focus}</div>
              <div className="text-[11px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {activeContract.cadence} · {activeContract.hoursPerMonth} hrs/month · until {new Date(activeContract.endsAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </div>
              <Link to="/supervision/contracts/$cid" params={{ cid: activeContract.id }} className="mt-3 inline-flex items-center gap-1 text-[11px]" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                View contract <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <Lock className="h-3.5 w-3.5" /> Private-notes partition
            </div>
            <p className="mt-2 text-[12px]" style={{ color: palette.muted }}>
              Your private reflections are stored separately and never visible to your supervisor. Their supervisory notes are equally invisible to you. Shared notes are the working record.
            </p>
          </div>
        </div>
      </div>

      {showNew && <NewSessionModal onClose={() => setShowNew(false)} contractId={activeContract?.id} supervisorName={activeContract ? "Dr. Ramesh Nair" : ""} />}
    </div>
  );
}

function SessionRow({ s }: { s: SupervisionSession }) {
  const past = s.status !== "upcoming";
  return (
    <Link to="/supervision/$sid" params={{ sid: s.id }} className="block rounded-2xl border p-4 hover:border-[var(--ink)] transition-all duration-[180ms]" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)", ["--ink" as string]: palette.ink }}>
      <div className="flex items-center justify-between text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3 w-3" />
          {new Date(s.scheduledAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {new Date(s.scheduledAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
        </span>
        <span className="uppercase tracking-[0.14em]">{s.status.replace("_", " ")}</span>
      </div>
      <div className="mt-2 text-[14px] line-clamp-2" style={{ color: palette.ink, fontFamily: past ? "inherit" : "'Fraunces', serif" }}>{s.agenda}</div>
      <div className="mt-2 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        {s.supervisorName} · {s.durationMin} min · {s.cases.length ? s.cases.map((c) => c.patientInitials).join(", ") : "no cases tagged"}{s.cpdEntryId ? " · CPD logged" : ""}
      </div>
    </Link>
  );
}

function Stat({ label, value, sub, tone = "ok" }: { label: string; value: string; sub: string; tone?: "ok" | "warn" }) {
  const border = tone === "warn" ? "rgba(203,108,84,0.4)" : palette.border;
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
      <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-1 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</div>
      <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{sub}</div>
    </div>
  );
}

function NewSessionModal({ onClose, contractId, supervisorName }: { onClose: () => void; contractId?: string; supervisorName: string }) {
  const [when, setWhen] = useState("");
  const [agenda, setAgenda] = useState("");
  const [duration, setDuration] = useState(60);
  const [cases, setCases] = useState("");
  const [markAttended, setMarkAttended] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,20,20,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-[560px] rounded-3xl border p-6" style={{ borderColor: palette.border, background: palette.solid }} onClick={(e) => e.stopPropagation()}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Log / schedule supervision session</div>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-[13px] mb-2" style={{ borderColor: palette.border }} />
        <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="Agenda — cases, questions, focus" rows={3} className="w-full border rounded-xl px-3 py-2 text-[13px] mb-2" style={{ borderColor: palette.border }} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} placeholder="Duration (min)" className="border rounded-xl px-3 py-2 text-[13px]" style={{ borderColor: palette.border }} />
          <input value={cases} onChange={(e) => setCases(e.target.value)} placeholder="Patient initials (S.M., R.K.)" className="border rounded-xl px-3 py-2 text-[12px]" style={{ borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace" }} />
        </div>
        <label className="flex items-center gap-2 text-[12px] mb-4" style={{ color: palette.ink }}>
          <input type="checkbox" checked={markAttended} onChange={(e) => setMarkAttended(e.target.checked)} /> Retroactive log — mark as attended and push to CPD
        </label>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5" style={{ color: palette.muted }}>Cancel</button>
          <button
            disabled={!when || !agenda || !contractId}
            onClick={() => {
              const t = new Date(when).getTime();
              const caseList = cases.split(",").map((c) => c.trim()).filter(Boolean).map((c) => ({ patientInitials: c, focus: "" }));
              const s = createSession({
                contractId: contractId!, role: "supervisee", scheduledAt: t, durationMin: duration,
                status: markAttended ? "attended" : "upcoming",
                agenda, cases: caseList, sharedNotes: "",
                supervisorId: "sv1", supervisorName, hoursForCpd: markAttended ? duration / 60 : duration / 60,
              });
              if (markAttended) {
                // Re-mark to trigger CPD push (createSession stored status but no CPD side-effect)
                import("@/lib/supervision-store").then(({ markAttended }) => markAttended(s.id));
              }
              onClose();
            }}
            className="rounded-full px-4 py-1.5 text-[12px] disabled:opacity-40"
            style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}
