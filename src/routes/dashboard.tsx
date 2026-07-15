import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, palette } from "@/components/practice/AppShell";
import {
  Video, MapPin, Phone, ArrowUpRight, AlertTriangle, MessageCircle, TrendingUp,
  CheckCircle2, XCircle, PhoneCall, FileText, Plus, PlayCircle, UserPlus, Clock,
  BarChart3, MessagesSquare, GraduationCap, ShieldCheck, CalendarClock,
} from "lucide-react";
import {
  SESSIONS_TODAY, ALERTS, PATIENTS, NOTES, INTAKES, WEEKLY_LOAD,
  REVENUE_SPARK, REVENUE_MONTH, WEEK_METRICS, INBOX, PEER_UPDATES, COMPLIANCE,
  getPatient,
} from "@/lib/practice-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — PeaceCode · Practice" },
      { name: "description", content: "Today's schedule, patient alerts, and practice health at a glance." },
    ],
  }),
  component: () => <AppShell crumb="Home"><Dashboard /></AppShell>,
});

const { surface, surface2, border, ink, muted, primary, soft } = palette;
const cardStyle = { background: surface, border: `1px solid ${border}` } as const;

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
const fmtDay = () => new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const relTime = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 3600_000;
  if (diff < 1) return `${Math.max(1, Math.round(diff * 60))}m ago`;
  if (diff < 24) return `${Math.round(diff)}h ago`;
  return `${Math.round(diff / 24)}d ago`;
};
const daysUntil = (iso: string) => Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 86400_000));

function Dashboard() {
  const inboxUnread = INBOX.filter((m) => m.unread).length;
  const alertsCount = ALERTS.length;
  const nextSession = SESSIONS_TODAY[0];
  const nextPatient = nextSession ? getPatient(nextSession.patientId) : null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-4">
      {/* ── Row 1 — Briefing bar ─────────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-[clamp(1.35rem,2vw,1.75rem)] tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif", color: ink }}>
              {greeting()}, Dr. Sharma
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: muted }}>{fmtDay()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill label="sessions today" value={String(SESSIONS_TODAY.length)} />
            <Pill label="unread messages" value={String(inboxUnread)} />
            <Pill label="alerts" value={String(alertsCount)} accent />
          </div>
        </div>
        {nextSession && nextPatient && (
          <div
            className="mt-4 flex items-center gap-2 text-[12.5px] px-3 py-2 rounded-xl"
            style={{ background: soft, color: ink }}
          >
            <CalendarClock className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
            <span style={{ color: muted }}>Next:</span>
            <span className="tabular-nums">{fmtTime(nextSession.startsAt)}</span>
            <span className="opacity-40">·</span>
            <span>{nextPatient.name}</span>
            <span className="opacity-40">·</span>
            <span>{nextSession.minutes}-min {nextSession.type}</span>
            <span className="opacity-40">·</span>
            <span className="capitalize">{nextSession.modality}</span>
            <button className="ml-auto text-[11px] px-3 py-1 rounded-full text-white" style={{ background: primary }}>Prep now</button>
          </div>
        )}
      </section>

      {/* ── Row 2 — Schedule (60) + Alerts (40) ──────────────── */}
      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12 lg:col-span-7 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Today's schedule" hint={`${SESSIONS_TODAY.length} sessions`} to="/schedule" />
          <div className="mt-4 divide-y" style={{ borderColor: border }}>
            {SESSIONS_TODAY.map((s) => {
              const p = getPatient(s.patientId);
              const Icon = s.modality === "video" ? Video : s.modality === "in-person" ? MapPin : Phone;
              return (
                <div key={s.id} className="py-3 flex items-center gap-3 group">
                  <div className="text-[12px] tabular-nums w-14 shrink-0" style={{ color: ink }}>{fmtTime(s.startsAt)}</div>
                  <span className="w-1 h-8 rounded-full" style={{ background: s.modality === "video" ? primary : s.modality === "in-person" ? "#8CB9A6" : "#C9A66B" }} />
                  {p && <Avatar patient={p} size={36} />}
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] truncate" style={{ color: ink }}>{p?.name}</div>
                    <div className="text-[11px] flex items-center gap-1.5" style={{ color: muted }}>
                      <Icon className="w-3 h-3" /> {s.type} · {s.minutes} min
                    </div>
                  </div>
                  <button className="text-[11px] px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: surface2, color: ink, border: `1px solid ${border}` }}>Prep</button>
                  <button className="text-[11px] px-3 py-1.5 rounded-full" style={{ background: ink, color: "#fff" }}>
                    {s.modality === "in-person" ? "Check in" : "Join"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Priority alerts" hint={`${ALERTS.length} to review`} to="/alerts" />
          <div className="mt-4 space-y-2.5">
            {ALERTS.map((a) => {
              const p = getPatient(a.patientId);
              const tone = a.priority === "high" ? { bg: "#FDECEC", ink: "#B54848", bd: "#F3C7C7" }
                : a.priority === "medium" ? { bg: soft, ink: primary, bd: border }
                : { bg: surface2, ink: muted, bd: border };
              const ActionIcon = a.action === "call" ? PhoneCall : a.action === "message" ? MessageCircle : FileText;
              const actionLabel = a.action === "call" ? "Call" : a.action === "message" ? "Message" : "Open note";
              return (
                <div key={a.id} className="rounded-xl p-3" style={{ background: tone.bg, border: `1px solid ${tone.bd}` }}>
                  <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em]" style={{ color: tone.ink }}>
                    <AlertTriangle className="w-3 h-3" /> {a.kind.replace("-", " ")}
                  </div>
                  <div className="text-[12.5px] mt-1" style={{ color: ink }}>{a.message}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[11px]" style={{ color: muted }}>{p?.name} · {relTime(a.createdAt)}</div>
                    <button className="text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(255,255,255,0.7)", color: tone.ink, border: `1px solid ${tone.bd}` }}>
                      <ActionIcon className="w-3 h-3" /> {actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Row 3 — Patient pulse grid ───────────────────────── */}
      <section className="rounded-2xl p-5" style={cardStyle}>
        <SectionHead title="Patient pulse" hint="Need attention this week" to="/patients" />
        <div className="mt-4 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory -mx-5 sm:mx-0 px-5 sm:px-0 pb-2 sm:pb-0">
          {PATIENTS.slice(0, 8).map((p) => {
            const risk = p.riskLevel;
            const dot = risk === "high" ? "#DC3B4A" : risk === "elevated" ? "#E08A3C" : risk === "moderate" ? "#C9A66B" : "#8CB9A6";
            return (
              <Link
                key={p.id}
                to="/patients/$id"
                params={{ id: p.id }}
                className="rounded-xl p-3 hover:shadow-sm transition-all snap-start shrink-0 w-[240px] sm:w-auto"
                style={{ background: surface2, border: `1px solid ${border}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar patient={p} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px]" style={{ color: ink }}>{p.name}</div>
                    <div className="text-[10px] truncate" style={{ color: muted }}>{p.primaryConcern}</div>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} title={`Risk: ${risk}`} aria-label={`Risk ${risk}`} />
                </div>
                <PhqSpark values={p.phq9} />
                <div className="mt-2 flex items-center justify-between text-[10px]" style={{ color: muted }}>
                  <span>PHQ-9 · 6w</span>
                  <span>{p.homework.status === "overdue" ? "Homework overdue" : p.nextSession ? `Next ${fmtDate(p.nextSession)}` : "No follow-up"}</span>
                </div>
                <button className="mt-2 w-full text-[11px] py-1 rounded-full" style={{ background: "#fff", color: ink, border: `1px solid ${border}` }}>
                  Send check-in
                </button>
              </Link>

            );
          })}
        </div>
      </section>

      {/* ── Row 4 — Practice metrics ─────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">
        <MetricCard label="Sessions completed" value={String(WEEK_METRICS.sessionsCompleted)} sub="this week" trend={+3} />
        <MetricCard label="Sessions cancelled" value={String(WEEK_METRICS.sessionsCancelled)} sub="this week" trend={-1} inverse />
        <MetricCard label="New patients" value={String(WEEK_METRICS.newPatients)} sub="this week" trend={+2} />
        <MetricCard label="Revenue" value={`₹${(WEEK_METRICS.revenue / 1000).toFixed(0)}k`} sub="this week" trend={+14} />
        <section className="col-span-12 lg:col-span-8 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Revenue · this month" hint={`Target ₹${(REVENUE_MONTH.target / 1000).toFixed(0)}k`} to="/payments" />
          <div className="mt-4 flex items-end gap-4">
            <div className="shrink-0">
              <div className="text-[28px] leading-none tabular-nums" style={{ fontFamily: "'Fraunces', serif", color: ink }}>₹{(REVENUE_MONTH.completed / 1000).toFixed(0)}k</div>
              <div className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "#1F7A3E" }}><TrendingUp className="w-3 h-3" /> +14% vs last month</div>
            </div>
            <AreaSpark values={REVENUE_SPARK} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Booked" value={`₹${(REVENUE_MONTH.booked / 1000).toFixed(0)}k`} />
            <MiniStat label="Completed" value={`₹${(REVENUE_MONTH.completed / 1000).toFixed(0)}k`} />
            <MiniStat label="Pending" value={`₹${(REVENUE_MONTH.pending / 1000).toFixed(0)}k`} />
          </div>
        </section>
        <section className="col-span-12 lg:col-span-4 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Weekly load" hint="Booked · capacity" to="/schedule" />
          <div className="mt-4 flex items-end gap-2 h-28">
            {WEEKLY_LOAD.map((d) => {
              const pct = d.capacity ? (d.booked / d.capacity) * 100 : 0;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-md relative flex-1" style={{ background: surface2 }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-md" style={{ background: primary, height: `${pct}%`, opacity: pct ? 1 : 0.15 }} />
                  </div>
                  <div className="text-[9.5px]" style={{ color: muted }}>{d.day}</div>
                  <div className="text-[9.5px] tabular-nums" style={{ color: ink }}>{d.booked}/{d.capacity}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Row 5 — Quick Actions rail ───────────────────────── */}
      <section className="rounded-2xl p-3" style={cardStyle}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <QuickAction to="/notes" icon={FileText} label="New note" />
          <QuickAction to="/sessions" icon={PlayCircle} label="Start session" />
          <QuickAction to="/patients" icon={UserPlus} label="Add patient" />
          <QuickAction to="/availability" icon={Clock} label="Block time" />
          <QuickAction to="/analytics" icon={BarChart3} label="Generate report" />
          <QuickAction to="/groups" icon={MessagesSquare} label="Message group" />
        </div>
      </section>

      {/* ── Row 6 — Inbox + Peer network ─────────────────────── */}
      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12 lg:col-span-7 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Inbox" hint={`${inboxUnread} unread`} to="/inbox" />
          <div className="mt-3 divide-y" style={{ borderColor: border }}>
            {INBOX.slice(0, 4).map((m) => {
              const p = getPatient(m.patientId);
              return (
                <div key={m.id} className="py-2.5 flex items-center gap-3">
                  {p && <Avatar patient={p} size={32} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px]" style={{ color: ink }}>{p?.name}</span>
                      {m.unread && <span className="w-1.5 h-1.5 rounded-full" style={{ background: primary }} />}
                    </div>
                    <div className="text-[11.5px] truncate" style={{ color: muted }}>{m.snippet}</div>
                  </div>
                  <div className="text-[10.5px] shrink-0" style={{ color: muted }}>{relTime(m.at)}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Peer network" to="/peers" />
          <div className="mt-3 space-y-2.5">
            {PEER_UPDATES.map((u) => (
              <div key={u.id} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] shrink-0 mt-0.5" style={{ background: soft, color: primary }}>
                  {u.who.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] leading-snug" style={{ color: ink }}>
                    <span className="font-medium">{u.who}</span> <span style={{ color: muted }}>{u.what}</span>
                  </div>
                  <div className="text-[10.5px] mt-0.5" style={{ color: muted }}>{relTime(u.at)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent notes tucked into remaining space */}
        <section className="col-span-12 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Recent notes" to="/notes" />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {NOTES.map((n) => {
              const p = getPatient(n.patientId);
              return (
                <div key={n.id} className="rounded-xl p-3" style={{ background: surface2, border: `1px solid ${border}` }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {p && <Avatar patient={p} size={24} />}
                    <div className="text-[11.5px]" style={{ color: ink }}>{p?.name}</div>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded ml-auto" style={{ background: surface, color: muted }}>{n.format}</span>
                  </div>
                  <p className="text-[11.5px] leading-snug line-clamp-3" style={{ color: muted }}>{n.summary}</p>
                  <div className="text-[10px] mt-1.5" style={{ color: muted }}>{relTime(n.createdAt)}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Row 7 — Footer strip ─────────────────────────────── */}
      <section className="rounded-2xl p-4 grid grid-cols-2 lg:grid-cols-4 gap-4" style={cardStyle}>
        <FooterStat
          icon={GraduationCap}
          label="CPD this quarter"
          value={`${COMPLIANCE.cpdHoursQuarter} / ${COMPLIANCE.cpdRequired} hrs`}
          progress={COMPLIANCE.cpdHoursQuarter / COMPLIANCE.cpdRequired}
        />
        <FooterStat
          icon={MessagesSquare}
          label="Next supervision"
          value={fmtDate(COMPLIANCE.nextSupervision)}
          sub={`in ${daysUntil(COMPLIANCE.nextSupervision)} days`}
        />
        <FooterStat
          icon={ShieldCheck}
          label="RCI licence"
          value={fmtDate(COMPLIANCE.licenseExpiresAt)}
          sub={`renews in ${daysUntil(COMPLIANCE.licenseExpiresAt)} days`}
        />
        <FooterStat
          icon={ShieldCheck}
          label="DPDP consent"
          value={COMPLIANCE.dpdpConsent === "current" ? "Current" : "Review due"}
          sub="All patient consents on file"
        />
      </section>
    </div>
  );
}

// ── Presentational bits ────────────────────────────────────
function SectionHead({ title, hint, to }: { title: string; hint?: string; to?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[10.5px] tracking-[0.24em] uppercase" style={{ color: primary }}>{title}</div>
        {hint && <div className="text-[11px] mt-0.5" style={{ color: muted }}>{hint}</div>}
      </div>
      {to && <Link to={to} className="text-[11px] flex items-center gap-0.5 hover:underline" style={{ color: muted }}>View <ArrowUpRight className="w-3 h-3" /></Link>}
    </div>
  );
}
function Pill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3 py-1.5 rounded-xl flex items-baseline gap-2" style={{ background: accent ? soft : surface2, border: `1px solid ${border}` }}>
      <span className="text-[15px] tabular-nums" style={{ color: ink, fontFamily: "'Fraunces', serif" }}>{value}</span>
      <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: muted }}>{label}</span>
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg py-2" style={{ background: surface2 }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: muted }}>{label}</div>
      <div className="text-[12.5px] tabular-nums mt-0.5" style={{ color: ink }}>{value}</div>
    </div>
  );
}
function MetricCard({ label, value, sub, trend, inverse }: { label: string; value: string; sub: string; trend: number; inverse?: boolean }) {
  const good = inverse ? trend < 0 : trend > 0;
  const color = good ? "#1F7A3E" : "#B54848";
  return (
    <div className="col-span-6 sm:col-span-3 lg:col-span-3 xl:col-span-3 rounded-2xl p-4" style={cardStyle}>
      <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: muted }}>{label}</div>
      <div className="text-[22px] tabular-nums mt-1" style={{ fontFamily: "'Fraunces', serif", color: ink }}>{value}</div>
      <div className="text-[11px] mt-1 flex items-center gap-1" style={{ color }}>
        <TrendingUp className="w-3 h-3" style={{ transform: trend < 0 ? "scaleY(-1)" : undefined }} />
        {trend > 0 ? "+" : ""}{trend}{typeof trend === "number" && Math.abs(trend) < 20 ? "" : "%"}
        <span className="opacity-70 ml-1" style={{ color: muted }}>{sub}</span>
      </div>
    </div>
  );
}
function QuickAction({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors hover:bg-black/[0.02]"
      style={{ background: surface2, border: `1px solid ${border}`, color: ink }}
    >
      <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: soft, color: primary }}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <span className="text-[12px]">{label}</span>
      <Plus className="w-3 h-3 ml-auto opacity-40" />
    </Link>
  );
}
function FooterStat({ icon: Icon, label, value, sub, progress }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; progress?: number }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em]" style={{ color: muted }}>
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-[14px] mt-1 tabular-nums" style={{ color: ink, fontFamily: "'Fraunces', serif" }}>{value}</div>
      {typeof progress === "number" && (
        <div className="mt-1.5 h-1 w-full rounded-full overflow-hidden" style={{ background: surface2 }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, progress * 100)}%`, background: primary }} />
        </div>
      )}
      {sub && <div className="text-[10.5px] mt-1" style={{ color: muted }}>{sub}</div>}
    </div>
  );
}
function Avatar({ patient, size = 32 }: { patient: { initials: string; avatar?: string; name: string }; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white overflow-hidden shrink-0"
      style={{ width: size, height: size, background: primary, fontSize: size * 0.36 }}
      aria-label={patient.name}
    >
      {patient.avatar
        ? <img src={patient.avatar} alt="" width={size} height={size} className="w-full h-full object-cover" loading="lazy" />
        : patient.initials}
    </div>
  );
}
function PhqSpark({ values }: { values: number[] }) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  const rising = values[values.length - 1] > values[0];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-8">
      <polyline points={pts} fill="none" stroke={rising ? "#DC3B4A" : "#1F7A3E"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
function AreaSpark({ values }: { values: number[] }) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / range) * 100}`);
  const line = pts.join(" ");
  const area = `0,100 ${line} 100,100`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="flex-1 h-16">
      <polygon points={area} fill={soft} opacity="0.7" />
      <polyline points={line} fill="none" stroke={primary} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
