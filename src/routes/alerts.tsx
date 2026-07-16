// Alerts — derived from real data: crisis risk, no-shows, overdue notes,
// long waitlist tenure. Dismissible per session; drill straight to context.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AlertOctagon, UserX, FileWarning, Clock, Check, ArrowRight, Bell } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLivePatients, RISK_META, avatarUrl, type Patient } from "@/lib/patients-store";
import { useLiveSessions } from "@/lib/sessions-store";
import { useLiveNotes } from "@/lib/notes-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — PeaceCode · Practice" },
      { name: "description", content: "Risk flags, no-shows, overdue documentation, and long waitlist tenure — all in one place." },
    ],
  }),
  component: AlertsPage,
});

type AlertKind = "crisis" | "no_show" | "overdue_note" | "long_wait";
type Alert = {
  id: string;
  kind: AlertKind;
  title: string;
  detail: string;
  at: number;
  patient?: Patient;
  href?: { to: string; params?: Record<string, string> };
};

const DAY = 86_400_000;
const KIND_META: Record<AlertKind, { label: string; color: string; bg: string; Icon: typeof AlertOctagon }> = {
  crisis:       { label: "Crisis",       color: "#B0384A", bg: "rgba(176,56,74,0.10)",  Icon: AlertOctagon },
  no_show:      { label: "No-show",      color: "#B85A3E", bg: "rgba(184,90,62,0.10)",  Icon: UserX },
  overdue_note: { label: "Overdue note", color: "#8a6d1e", bg: "rgba(203,167,66,0.14)", Icon: FileWarning },
  long_wait:    { label: "Long wait",    color: "#3B6E8F", bg: "rgba(59,110,143,0.10)", Icon: Clock },
};

// ── dismissal store (sessionStorage-backed) ───────────────────────
const DISMISS_KEY = "pc.alerts.dismissed.v1";
const dismissListeners = new Set<() => void>();
function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { const raw = window.sessionStorage.getItem(DISMISS_KEY); return new Set(raw ? JSON.parse(raw) : []); } catch { return new Set(); }
}
function writeDismissed(s: Set<string>) {
  try { window.sessionStorage.setItem(DISMISS_KEY, JSON.stringify([...s])); } catch { /* noop */ }
  dismissListeners.forEach((l) => l());
}
function useDismissed(): { has: (id: string) => boolean; add: (id: string) => void; clear: () => void; count: number } {
  const set = useSyncExternalStore(
    (fn) => { dismissListeners.add(fn); return () => dismissListeners.delete(fn); },
    () => readDismissed(),
    () => new Set<string>(),
  );
  return {
    has: (id) => set.has(id),
    add: (id) => { const next = new Set(set); next.add(id); writeDismissed(next); },
    clear: () => writeDismissed(new Set()),
    count: set.size,
  };
}

function AlertsPage() {
  const hydrated = useHydrated();
  const patients = useLivePatients();
  const sessions = useLiveSessions();
  const notes = useLiveNotes();
  const dismissed = useDismissed();
  const [filter, setFilter] = useState<"all" | AlertKind>("all");

  const alerts = useMemo<Alert[]>(() => {
    const now = Date.now();
    const out: Alert[] = [];

    // 1. Crisis risk
    patients.filter((p) => p.risk === "crisis" && p.status !== "discharged").forEach((p) => {
      out.push({
        id: `crisis:${p.id}`,
        kind: "crisis",
        title: `${p.preferredName ?? p.fullName} flagged crisis`,
        detail: p.primaryConcern,
        at: p.updatedAt,
        patient: p,
        href: { to: "/patients/$pid", params: { pid: p.id } },
      });
    });

    // 2. No-show sessions (past 14 days)
    sessions.filter((s) => s.status === "no_show" && new Date(s.startsAt).getTime() > now - 14 * DAY).forEach((s) => {
      const p = patients.find((x) => x.id === s.patientId);
      out.push({
        id: `noshow:${s.id}`,
        kind: "no_show",
        title: `${p?.preferredName ?? p?.fullName ?? "Patient"} missed a session`,
        detail: `${new Date(s.startsAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · ${s.service}`,
        at: new Date(s.startsAt).getTime(),
        patient: p,
        href: p ? { to: "/patients/$pid", params: { pid: p.id } } : undefined,
      });
    });

    // 3. Overdue notes (draft > 48h old)
    notes.filter((n) => n.status === "draft" && n.updatedAt < now - 2 * DAY).forEach((n) => {
      const p = patients.find((x) => x.id === n.patientId);
      out.push({
        id: `note:${n.id}`,
        kind: "overdue_note",
        title: `Unsigned note · ${p?.preferredName ?? p?.fullName ?? "Patient"}`,
        detail: `Draft ${Math.round((now - n.updatedAt) / DAY)}d old — sign or amend`,
        at: n.updatedAt,
        patient: p,
        href: { to: "/notes/$nid", params: { nid: n.id } },
      });
    });

    // 4. Long waitlist tenure (>30d)
    patients.filter((p) => p.status === "waitlist" && p.intakeDate < now - 30 * DAY).forEach((p) => {
      out.push({
        id: `wait:${p.id}`,
        kind: "long_wait",
        title: `${p.preferredName ?? p.fullName} waited ${Math.round((now - p.intakeDate) / DAY)}d`,
        detail: "Prospective intake — decide or transfer",
        at: p.intakeDate,
        patient: p,
        href: { to: "/waitlist" },
      });
    });

    return out.sort((a, b) => b.at - a.at);
  }, [patients, sessions, notes]);

  const visible = alerts.filter((a) => !dismissed.has(a.id) && (filter === "all" || a.kind === filter));
  const counts = useMemo(() => {
    const c: Record<AlertKind, number> = { crisis: 0, no_show: 0, overdue_note: 0, long_wait: 0 };
    alerts.forEach((a) => { if (!dismissed.has(a.id)) c[a.kind]++; });
    return c;
  }, [alerts, dismissed]);

  if (!hydrated) return <AppShell crumb="Alerts"><div /></AppShell>;

  return (
    <AppShell crumb="Alerts">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 pb-16">
        <header className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Alerts
            </h1>
            <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>
              {visible.length ? `${visible.length} needing attention` : "You're caught up."}
              {dismissed.count > 0 && <> · <button onClick={dismissed.clear} className="underline">restore {dismissed.count} dismissed</button></>}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(Object.keys(KIND_META) as AlertKind[]).map((k) => {
            const meta = KIND_META[k];
            const on = filter === k;
            const Icon = meta.Icon;
            return (
              <button key={k} onClick={() => setFilter(on ? "all" : k)} className="text-left rounded-2xl border p-4 transition-all hover:-translate-y-0.5" style={{ background: on ? meta.bg : "rgba(255,255,255,0.6)", borderColor: on ? meta.color : palette.border }}>
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
          <div className="rounded-2xl border p-12 text-center" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
            <Bell className="h-6 w-6 mx-auto mb-3" style={{ color: palette.muted }} />
            <p className="text-[13px]" style={{ color: palette.muted }}>Nothing needs your attention right now.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((a) => <AlertRow key={a.id} a={a} onDismiss={() => dismissed.add(a.id)} />)}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function AlertRow({ a, onDismiss }: { a: Alert; onDismiss: () => void }) {
  const meta = KIND_META[a.kind];
  const Icon = meta.Icon;
  const risk = a.patient ? RISK_META[a.patient.risk] : null;
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border p-3.5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: meta.bg }}>
          <Icon className="h-4 w-4" style={{ color: meta.color }} />
        </div>
        {a.patient && <img src={avatarUrl(a.patient.id)} alt="" className="h-9 w-9 rounded-full object-cover" />}
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
      <div className="flex items-center gap-1.5">
        {a.href && (
          <Link to={a.href.to} params={a.href.params} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: palette.ink, color: "#fff" }}>
            Open <ArrowRight className="h-3 w-3" />
          </Link>
        )}
        <button onClick={onDismiss} title="Dismiss" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}>
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
