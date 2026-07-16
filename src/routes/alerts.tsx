// Alerts — derived from real data; snooze with expiry, per-kind actions,
// grouping by patient, rules panel.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertOctagon, UserX, FileWarning, Clock, Check, ArrowRight, Bell, BellOff,
  Volume2, Volume, MoreHorizontal, Send, Phone, CalendarClock, Settings2, X, Users,
} from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLivePatients, RISK_META, avatarUrl, type Patient } from "@/lib/patients-store";
import { useLiveSessions, rescheduleSession } from "@/lib/sessions-store";
import { useLiveNotes } from "@/lib/notes-store";
import { usePrefs, setKindEnabled, toggleSound, snooze, dismiss, restoreAll, purgeExpiredSnoozes, snoozeUntil } from "@/lib/alert-prefs-store";
import type { AlertKind } from "@/lib/alert-kinds";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — PeaceCode · Practice" },
      { name: "description", content: "Risk flags, no-shows, overdue documentation, and long waitlist tenure — with per-alert actions and snoozing." },
    ],
  }),
  component: AlertsPage,
});

type Alert = {
  id: string;
  kind: AlertKind;
  title: string;
  detail: string;
  at: number;
  patient?: Patient;
  meta?: { noteId?: string; sessionId?: string };
};

const DAY = 86_400_000;
const KIND_META: Record<AlertKind, { label: string; color: string; bg: string; Icon: typeof AlertOctagon }> = {
  crisis:       { label: "Crisis",       color: "#B0384A", bg: "rgba(176,56,74,0.10)",  Icon: AlertOctagon },
  no_show:      { label: "No-show",      color: "#B85A3E", bg: "rgba(184,90,62,0.10)",  Icon: UserX },
  overdue_note: { label: "Overdue note", color: "#8a6d1e", bg: "rgba(203,167,66,0.14)", Icon: FileWarning },
  long_wait:    { label: "Long wait",    color: "#3B6E8F", bg: "rgba(59,110,143,0.10)", Icon: Clock },
};

function AlertsPage() {
  const hydrated = useHydrated();
  const patients = useLivePatients();
  const sessions = useLiveSessions();
  const notes = useLiveNotes();
  const prefs = usePrefs();
  const [filter, setFilter] = useState<"all" | AlertKind>("all");
  const [grouped, setGrouped] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  // purge expired snoozes once on mount so alerts return automatically
  useEffect(() => { purgeExpiredSnoozes(); }, []);

  const alerts = useMemo<Alert[]>(() => {
    const now = Date.now();
    const out: Alert[] = [];
    if (prefs.enabled.crisis) {
      patients.filter((p) => p.risk === "crisis" && p.status !== "discharged").forEach((p) => {
        out.push({ id: `crisis:${p.id}`, kind: "crisis", title: `${p.preferredName ?? p.fullName} flagged crisis`, detail: p.primaryConcern, at: p.updatedAt, patient: p });
      });
    }
    if (prefs.enabled.no_show) {
      sessions.filter((s) => s.status === "no_show" && new Date(s.startsAt).getTime() > now - 14 * DAY).forEach((s) => {
        const p = patients.find((x) => x.id === s.patientId);
        out.push({ id: `noshow:${s.id}`, kind: "no_show", title: `${p?.preferredName ?? p?.fullName ?? "Patient"} missed a session`, detail: `${new Date(s.startsAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · ${s.service}`, at: new Date(s.startsAt).getTime(), patient: p, meta: { sessionId: s.id } });
      });
    }
    if (prefs.enabled.overdue_note) {
      notes.filter((n) => n.status === "draft" && n.updatedAt < now - 2 * DAY).forEach((n) => {
        const p = patients.find((x) => x.id === n.patientId);
        out.push({ id: `note:${n.id}`, kind: "overdue_note", title: `Unsigned note · ${p?.preferredName ?? p?.fullName ?? "Patient"}`, detail: `Draft ${Math.round((now - n.updatedAt) / DAY)}d old — sign or amend`, at: n.updatedAt, patient: p, meta: { noteId: n.id } });
      });
    }
    if (prefs.enabled.long_wait) {
      patients.filter((p) => p.status === "waitlist" && p.intakeDate < now - 30 * DAY).forEach((p) => {
        out.push({ id: `wait:${p.id}`, kind: "long_wait", title: `${p.preferredName ?? p.fullName} waited ${Math.round((now - p.intakeDate) / DAY)}d`, detail: "Prospective intake — decide or transfer", at: p.intakeDate, patient: p });
      });
    }
    return out.sort((a, b) => b.at - a.at);
  }, [patients, sessions, notes, prefs.enabled]);

  const active = alerts.filter((a) => !prefs.dismissed.includes(a.id) && !prefs.snoozes[a.id]);
  const snoozedList = alerts.filter((a) => prefs.snoozes[a.id]);
  const visible = active.filter((a) => filter === "all" || a.kind === filter);

  const counts = useMemo(() => {
    const c: Record<AlertKind, number> = { crisis: 0, no_show: 0, overdue_note: 0, long_wait: 0 };
    active.forEach((a) => c[a.kind]++);
    return c;
  }, [active]);

  // group by patient
  const groupedList = useMemo(() => {
    const map = new Map<string, Alert[]>();
    visible.forEach((a) => {
      const key = a.patient?.id ?? "_no_patient";
      const bucket = map.get(key) ?? [];
      bucket.push(a); map.set(key, bucket);
    });
    return [...map.values()].sort((a, b) => b[0].at - a[0].at);
  }, [visible]);

  const totalHidden = prefs.dismissed.length + Object.keys(prefs.snoozes).length;

  if (!hydrated) return <AppShell crumb="Alerts"><div /></AppShell>;

  return (
    <AppShell crumb="Alerts">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 pb-16">
        <header className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Alerts</h1>
            <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>
              {active.length ? `${active.length} needing attention` : "You're caught up."}
              {totalHidden > 0 && <> · <button onClick={restoreAll} className="underline">restore {totalHidden} hidden</button></>}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setGrouped(!grouped)} title="Group by patient" className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11.5px]" style={{ borderColor: palette.border, color: grouped ? palette.ink : palette.muted, background: grouped ? "rgba(0,0,0,0.04)" : "transparent" }}>
              <Users className="h-3.5 w-3.5" /> Group
            </button>
            <button onClick={toggleSound} title={prefs.sound ? "Mute" : "Unmute"} className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: prefs.sound ? palette.ink : palette.muted }}>
              {prefs.sound ? <Volume2 className="h-3.5 w-3.5" /> : <Volume className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => setRulesOpen(true)} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11.5px]" style={{ borderColor: palette.border, color: palette.ink }}>
              <Settings2 className="h-3.5 w-3.5" /> Rules
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(Object.keys(KIND_META) as AlertKind[]).map((k) => {
            const meta = KIND_META[k];
            const on = filter === k;
            const disabled = !prefs.enabled[k];
            const Icon = meta.Icon;
            return (
              <button key={k} onClick={() => setFilter(on ? "all" : k)} className="text-left rounded-2xl border p-4 transition-all hover:-translate-y-0.5 disabled:opacity-40" disabled={disabled} style={{ background: on ? meta.bg : "rgba(255,255,255,0.6)", borderColor: on ? meta.color : palette.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] tracking-[0.18em] uppercase" style={{ color: meta.color, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{meta.label}</span>
                  <Icon className="h-4 w-4" style={{ color: meta.color }} />
                </div>
                <div className="tabular-nums leading-none mt-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 36 }}>{counts[k]}</div>
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ borderColor: palette.border, background: palette.glass }}>
            <Bell className="h-6 w-6 mx-auto mb-3" style={{ color: palette.muted }} />
            <p className="text-[13px]" style={{ color: palette.muted }}>Nothing needs your attention right now.</p>
          </div>
        ) : grouped ? (
          <div className="space-y-4">
            {groupedList.map((bucket) => (
              <div key={bucket[0].patient?.id ?? "_"} className="rounded-2xl border p-3" style={{ borderColor: palette.border, background: palette.glassStrong }}>
                {bucket[0].patient && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <img src={avatarUrl(bucket[0].patient.id)} alt="" className="h-7 w-7 rounded-full object-cover" />
                    <Link to="/patients/$pid" params={{ pid: bucket[0].patient.id }} className="text-[13px] hover:underline" style={{ color: palette.ink }}>{bucket[0].patient.preferredName ?? bucket[0].patient.fullName}</Link>
                    <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>· {bucket.length} alerts</span>
                  </div>
                )}
                <ul className="space-y-2">{bucket.map((a) => <AlertRow key={a.id} a={a} showAvatar={false} />)}</ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">{visible.map((a) => <AlertRow key={a.id} a={a} />)}</ul>
        )}

        {snoozedList.length > 0 && (
          <section className="mt-8">
            <h3 className="text-[10.5px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Snoozed · {snoozedList.length}</h3>
            <ul className="space-y-1">
              {snoozedList.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-[12px] p-2.5 rounded-xl border" style={{ borderColor: palette.border, background: palette.glass }}>
                  <BellOff className="h-3.5 w-3.5" style={{ color: palette.muted }} />
                  <span style={{ color: palette.ink }}>{a.title}</span>
                  <span className="ml-auto text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>returns {new Date(prefs.snoozes[a.id]).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {rulesOpen && <RulesDialog onClose={() => setRulesOpen(false)} />}
    </AppShell>
  );
}

function AlertRow({ a, showAvatar = true }: { a: Alert; showAvatar?: boolean }) {
  const meta = KIND_META[a.kind];
  const Icon = meta.Icon;
  const risk = a.patient ? RISK_META[a.patient.risk] : null;
  const [snoozeOpen, setSnoozeOpen] = useState(false);

  function doSnooze(preset: "hour" | "tomorrow" | "monday") {
    snooze(a.id, snoozeUntil(preset));
    setSnoozeOpen(false);
  }

  function primaryAction() {
    if (a.kind === "no_show" && a.meta?.sessionId && a.patient) {
      const when = prompt("Reschedule to (YYYY-MM-DD HH:MM):");
      if (when) {
        const iso = new Date(when).toISOString();
        rescheduleSession(a.meta.sessionId, iso);
      }
    }
  }

  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border p-3.5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: meta.bg }}>
          <Icon className="h-4 w-4" style={{ color: meta.color }} />
        </div>
        {showAvatar && a.patient && <img src={avatarUrl(a.patient.id)} alt="" className="h-9 w-9 rounded-full object-cover" />}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[13.5px]" style={{ color: palette.ink }}>{a.title}</span>
          <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: meta.color, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{meta.label}</span>
          {risk && a.patient!.risk !== "stable" && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em]" style={{ background: risk.softToken, color: risk.token, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{risk.label}</span>
          )}
        </div>
        <div className="text-[12px] mt-0.5 truncate" style={{ color: palette.muted }}>{a.detail}</div>
      </div>
      <div className="flex items-center gap-1.5 relative">
        {/* Kind-specific primary action */}
        {a.kind === "crisis" && a.patient?.emergencyContact && (
          <a href={`tel:${a.patient.emergencyContact.phone}`} title="Call ICE" className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: "#B0384A", color: "#fff" }}>
            <Phone className="h-3 w-3" /> ICE
          </a>
        )}
        {a.kind === "no_show" && (
          <button onClick={primaryAction} title="Reschedule" className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: palette.primary, color: "#fff" }}>
            <CalendarClock className="h-3 w-3" /> Reschedule
          </button>
        )}
        {a.kind === "overdue_note" && a.meta?.noteId && (
          <Link to="/notes/$nid" params={{ nid: a.meta.noteId }} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: palette.primary, color: "#fff" }}>
            Sign
          </Link>
        )}
        {a.kind === "long_wait" && (
          <Link to="/waitlist" className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: palette.primary, color: "#fff" }}>
            <Send className="h-3 w-3" /> Offer
          </Link>
        )}

        {/* Snooze menu */}
        <div className="relative">
          <button onClick={() => setSnoozeOpen((v) => !v)} title="Snooze" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}>
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          {snoozeOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 rounded-xl border shadow-lg py-1 min-w-[160px]" style={{ borderColor: palette.border, background: "#FFFDFB" }}>
              <button onClick={() => doSnooze("hour")} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-black/[0.04]">Snooze 1 hour</button>
              <button onClick={() => doSnooze("tomorrow")} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-black/[0.04]">Tomorrow 9am</button>
              <button onClick={() => doSnooze("monday")} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-black/[0.04]">Next Monday 9am</button>
            </div>
          )}
        </div>

        {a.patient && (
          <Link to="/patients/$pid" params={{ pid: a.patient.id }} className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        <button onClick={() => dismiss(a.id)} title="Dismiss" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}>
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

function RulesDialog({ onClose }: { onClose: () => void }) {
  const prefs = usePrefs();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,15,20,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl p-6" style={{ background: "#FFFDFB", border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Alert rules</h2>
          <button onClick={onClose} className="rounded-full border p-1.5" style={{ borderColor: palette.border }}><X className="h-4 w-4" /></button>
        </div>
        <p className="text-[12px] mb-4" style={{ color: palette.muted }}>Turn kinds off to stop them from surfacing. Existing dismissals and snoozes are preserved.</p>
        <ul className="space-y-2">
          {(Object.keys(KIND_META) as AlertKind[]).map((k) => {
            const meta = KIND_META[k];
            const on = prefs.enabled[k];
            const Icon = meta.Icon;
            return (
              <li key={k} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: palette.border, background: palette.glass }}>
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: meta.bg }}>
                  <Icon className="h-4 w-4" style={{ color: meta.color }} />
                </div>
                <span className="flex-1 text-[13px]" style={{ color: palette.ink }}>{meta.label}</span>
                <button onClick={() => setKindEnabled(k, !on)} className="rounded-full px-3 py-1 text-[11px]" style={{ background: on ? "#2F6A4A" : "rgba(0,0,0,0.06)", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  {on ? "on" : "off"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
