import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, palette } from "@/components/practice/AppShell";
import {
  Video, MapPin, Phone, ArrowUpRight, AlertTriangle, MessageCircle, TrendingUp,
  PhoneCall, FileText, Plus, PlayCircle, UserPlus, Clock,
  BarChart3, MessagesSquare, GraduationCap, ShieldCheck, CalendarClock,
  ChevronDown, Sparkles, HeartPulse, Wallet,
} from "lucide-react";
import {
  SESSIONS_TODAY, ALERTS, PATIENTS, NOTES, INTAKES, WEEKLY_LOAD,
  REVENUE_SPARK, REVENUE_MONTH, WEEK_METRICS, INBOX, PEER_UPDATES, COMPLIANCE,
  getPatient,
} from "@/lib/practice-store";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useIsTouch } from "@/hooks/use-is-touch";
import { AnimatedIcon } from "@/components/practice/AnimatedIcon";
import { CardIllustration } from "@/components/practice/CardIllustration";
import { MentalHealthIllustration } from "@/components/practice/MentalHealthIllustration";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — PeaceCode · Practice" },
      { name: "description", content: "Today's schedule, patient alerts, and practice health at a glance." },
    ],
  }),
  component: () => <AppShell crumb="Home"><Dashboard /></AppShell>,
});

const { surface, surface2, border, ink, muted, primary, soft, inkContrast, glassStrong } = palette;
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

type RotatingFacet = { label: string; value: string; sub?: string };

function Dashboard() {
  const inboxUnread = INBOX.filter((m) => m.unread).length;
  const alertsCount = ALERTS.length;
  const nextSession = SESSIONS_TODAY[0];
  const nextPatient = nextSession ? getPatient(nextSession.patientId) : null;

  // Apple-Health-style: compact by default, "Show more" reveals the rest.
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const [showAllAlerts,   setShowAllAlerts]   = useState(false);
  const [showAllPulse,    setShowAllPulse]    = useState(false);
  const [showAllInbox,    setShowAllInbox]    = useState(false);
  const [showAllPeers,    setShowAllPeers]    = useState(false);
  const [showNotes,       setShowNotes]       = useState(false);

  const scheduleShown = showAllSchedule ? SESSIONS_TODAY : SESSIONS_TODAY.slice(0, 3);
  const alertsShown   = showAllAlerts   ? ALERTS         : ALERTS.slice(0, 2);
  const pulseShown    = showAllPulse    ? PATIENTS.slice(0, 8) : PATIENTS.slice(0, 3);
  const inboxShown    = showAllInbox    ? INBOX.slice(0, 8) : INBOX.slice(0, 3);
  const peersShown    = showAllPeers    ? PEER_UPDATES : PEER_UPDATES.slice(0, 3);

  const revenuePct = Math.round((REVENUE_MONTH.completed / REVENUE_MONTH.target) * 100);
  const capacityPct = Math.round(
    (WEEKLY_LOAD.reduce((a, d) => a + d.booked, 0) /
      Math.max(1, WEEKLY_LOAD.reduce((a, d) => a + d.capacity, 0))) * 100,
  );
  const alertRing = Math.min(100, alertsCount * 20);

  // Rotating micro-stat tiles: each cycles through a few facets every 4s so
  // the dashboard breathes without ever demanding the user's attention.
  const pulseTiles: RotatingFacet[][] = [
    [
      { label: "Sessions today", value: String(SESSIONS_TODAY.length), sub: `${SESSIONS_TODAY.filter(s=>s.modality==="video").length} video` },
      { label: "Next session", value: nextSession ? fmtTime(nextSession.startsAt) : "—", sub: nextPatient?.name ?? "no next" },
      { label: "Avg session", value: `${Math.round(SESSIONS_TODAY.reduce((a,s)=>a+s.minutes,0)/Math.max(1,SESSIONS_TODAY.length))}m`, sub: "today" },
    ],
    [
      { label: "New this week", value: String(WEEK_METRICS.newPatients), sub: "intakes" },
      { label: "Active caseload", value: String(PATIENTS.length), sub: "patients" },
      { label: "High risk", value: String(PATIENTS.filter(p=>p.riskLevel==="high").length), sub: "need check-in" },
    ],
    [
      { label: "Revenue", value: `₹${(REVENUE_MONTH.completed/1000).toFixed(0)}k`, sub: `${revenuePct}% of target` },
      { label: "Pending", value: `₹${(REVENUE_MONTH.pending/1000).toFixed(0)}k`, sub: "to collect" },
      { label: "Booked", value: `₹${(REVENUE_MONTH.booked/1000).toFixed(0)}k`, sub: "on the calendar" },
    ],
    [
      { label: "Unread inbox", value: String(inboxUnread), sub: "from patients" },
      { label: "Notes drafted", value: String(NOTES.length), sub: "this week" },
      { label: "Peer updates", value: String(PEER_UPDATES.length), sub: "in your network" },
    ],
  ];

  return (
    <div
      className="mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
      style={{ maxWidth: 1280 }}
    >
      <div className="grid grid-cols-12 gap-3 sm:gap-4">

        {/* ─── Hero (span-8): greeting + next session, with illustration ── */}
        <section
          className="relative col-span-12 lg:col-span-8 rounded-3xl p-4 sm:p-5 lg:p-6 overflow-hidden"
          style={cardStyle}
        >
          <CardIllustration kind="orbit" color={primary} size={220} className="-right-8 -top-8" />
          <MentalHealthIllustration kind="breath" color={primary} size={150} className="-left-6 -bottom-6 opacity-70" />
          <MentalHealthIllustration kind="wave" color={primary} size={180} className="right-24 -bottom-10 hidden md:block opacity-60" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-[10.5px] uppercase tracking-[0.24em]" style={{ color: primary }}>{fmtDay()}</div>
              <h1 className="mt-1 text-[clamp(1.5rem,2.4vw,2rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: ink }}>
                {greeting()}, Dr. Sharma
              </h1>
              <p className="text-[12.5px] mt-1 max-w-md" style={{ color: muted }}>
                {SESSIONS_TODAY.length} sessions on the calendar · {alertsCount} to review · {inboxUnread} unread notes from patients.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedIcon icon={Sparkles} motion="breathe" bg={soft} color={primary} ring={border} size={16} />
              <Link to="/copilot" className="text-[11.5px] px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity" style={{ background: ink, color: inkContrast }}>
                Ask copilot
              </Link>
            </div>
          </div>

          {nextSession && nextPatient && (
            <div className="relative mt-5 rounded-2xl p-4 flex items-center gap-3 flex-wrap" style={{ background: soft, border: `1px solid ${border}` }}>
              <AnimatedIcon
                icon={nextSession.modality === "video" ? Video : nextSession.modality === "in-person" ? MapPin : Phone}
                motion="float"
                bg={surface}
                color={primary}
                ring={border}
                size={18}
              />
              <div className="min-w-0">
                <div className="text-[10.5px] uppercase tracking-[0.2em]" style={{ color: muted }}>Next up</div>
                <div className="text-[14px] mt-0.5" style={{ color: ink, fontFamily: "'Fraunces', serif" }}>
                  {nextPatient.name} · <span className="tabular-nums">{fmtTime(nextSession.startsAt)}</span>
                </div>
                <div className="text-[11.5px]" style={{ color: muted }}>
                  {nextSession.minutes}-min {nextSession.type} · <span className="capitalize">{nextSession.modality}</span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button className="text-[11px] px-3 py-1.5 rounded-full" style={{ background: glassStrong, color: ink, border: `1px solid ${border}` }}>Prep</button>
                <button className="text-[11px] px-3 py-1.5 rounded-full" style={{ background: primary, color: inkContrast }}>
                  {nextSession.modality === "in-person" ? "Check in" : "Join"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ─── Rings (span-4): three health-style KPI rings ─────────────── */}
        <section className="col-span-12 lg:col-span-4 rounded-3xl p-4 sm:p-5 relative overflow-hidden" style={cardStyle}>
          <CardIllustration kind="bloom" color={primary} size={160} className="-right-6 -bottom-10" />
          <div className="text-[10.5px] uppercase tracking-[0.24em]" style={{ color: primary }}>Practice pulse</div>
          <div className="mt-4 grid grid-cols-3 gap-3 relative">
            <Ring label="Revenue"  value={`${revenuePct}%`}  pct={revenuePct}  color={primary}   to="/payments" />
            <Ring label="Capacity" value={`${capacityPct}%`} pct={capacityPct} color="var(--status-calm)"   to="/schedule" />
            <Ring label="Alerts"   value={String(alertsCount)} pct={alertRing} color="var(--status-danger-strong)"   to="/alerts" />

          </div>
          <div className="mt-4 text-[11px] flex items-center gap-1.5" style={{ color: muted }}>
            <HeartPulse className="w-3 h-3" style={{ color: primary }} /> Steady week — nothing needs your attention right now.
          </div>
        </section>

        {/* ─── Rotating micro-stat tiles: 4 compact cards that cycle facets ── */}
        {pulseTiles.map((facets, i) => (
          <RotatingTile
            key={i}
            facets={facets}
            accent={i % 2 === 0 ? primary : "var(--status-calm)"}
            delayMs={i * 900}
          />
        ))}



        {/* ─── Schedule ─────────────────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-7 rounded-3xl p-4 sm:p-5 relative overflow-hidden" style={cardStyle}>
          <CardIllustration kind="waves" color={primary} size={200} className="-right-4 -bottom-10" />
          <SectionHead title="Today's schedule" hint={`${SESSIONS_TODAY.length} sessions`} to="/schedule" />
          <div className="mt-3 divide-y" style={{ borderColor: border }}>
            {scheduleShown.map((s) => {
              const p = getPatient(s.patientId);
              const Icon = s.modality === "video" ? Video : s.modality === "in-person" ? MapPin : Phone;
              return (
                <div key={s.id} className="py-2.5 flex items-center gap-3 group pc-reveal">
                  <div className="text-[12px] tabular-nums w-14 shrink-0" style={{ color: ink }}>{fmtTime(s.startsAt)}</div>
                  <span className="w-1 h-8 rounded-full" style={{ background: s.modality === "video" ? primary : s.modality === "in-person" ? "#8CB9A6" : "#C9A66B" }} />
                  {p && <Avatar patient={p} size={32} />}
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] truncate" style={{ color: ink }}>{p?.name}</div>
                    <div className="text-[11px] flex items-center gap-1.5" style={{ color: muted }}>
                      <Icon className="w-3 h-3" /> {s.type} · {s.minutes} min
                    </div>
                  </div>
                  <button className="text-[11px] px-3 py-1.5 rounded-full" style={{ background: primary, color: inkContrast }}>
                    {s.modality === "in-person" ? "Check in" : "Join"}
                  </button>
                </div>
              );
            })}
          </div>
          {SESSIONS_TODAY.length > 3 && (
            <LoadMoreButton
              expanded={showAllSchedule}
              hiddenCount={SESSIONS_TODAY.length - 3}
              onClick={() => setShowAllSchedule((v) => !v)}
            />
          )}
        </section>

        {/* ─── Alerts ───────────────────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-5 rounded-3xl p-4 sm:p-5 relative overflow-hidden" style={cardStyle}>
          <CardIllustration kind="peak" color="#B54848" size={160} className="-right-4 -bottom-8" />
          <SectionHead title="Priority alerts" hint={`${ALERTS.length} to review`} to="/alerts" />
          <div className="mt-3 space-y-2">
            {alertsShown.map((a) => {
              const p = getPatient(a.patientId);
              const tone = a.priority === "high" ? { bg: "#FDECEC", ink: "#B54848", bd: "#F3C7C7" }
                : a.priority === "medium" ? { bg: soft, ink: primary, bd: border }
                : { bg: surface2, ink: muted, bd: border };
              const ActionIcon = a.action === "call" ? PhoneCall : a.action === "message" ? MessageCircle : FileText;
              const actionLabel = a.action === "call" ? "Call" : a.action === "message" ? "Message" : "Open";
              return (
                <div key={a.id} className="rounded-xl p-3 pc-reveal" style={{ background: tone.bg, border: `1px solid ${tone.bd}` }}>
                  <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em]" style={{ color: tone.ink }}>
                    <AlertTriangle className="w-3 h-3" /> {a.kind.replace("-", " ")}
                  </div>
                  <div className="text-[12.5px] mt-1" style={{ color: ink }}>{a.message}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[11px]" style={{ color: muted }}>{p?.name} · {relTime(a.createdAt)}</div>
                    <button className="text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: glassStrong, color: tone.ink, border: `1px solid ${tone.bd}` }}>
                      <ActionIcon className="w-3 h-3" /> {actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {ALERTS.length > 2 && (
            <LoadMoreButton
              expanded={showAllAlerts}
              hiddenCount={ALERTS.length - 2}
              onClick={() => setShowAllAlerts((v) => !v)}
            />
          )}
        </section>

        {/* ─── Revenue + Weekly load: side-by-side charts ───────────────── */}
        <section className="col-span-12 lg:col-span-7 rounded-3xl p-4 sm:p-5 relative overflow-hidden" style={cardStyle}>
          <CardIllustration kind="arch" color={primary} size={160} className="-right-4 -bottom-8" />
          <SectionHead title="Revenue · this month" hint={`Target ₹${(REVENUE_MONTH.target / 1000).toFixed(0)}k`} to="/payments" />
          <div className="mt-3 flex items-end gap-4">
            <div className="shrink-0">
              <div className="text-[26px] leading-none tabular-nums" style={{ fontFamily: "'Fraunces', serif", color: ink }}>₹{(REVENUE_MONTH.completed / 1000).toFixed(0)}k</div>
              <div className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "#1F7A3E" }}><TrendingUp className="w-3 h-3" /> +14% vs last month</div>
            </div>
            <AreaSpark values={REVENUE_SPARK} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <MiniStat label="Booked" value={`₹${(REVENUE_MONTH.booked / 1000).toFixed(0)}k`} />
            <MiniStat label="Done" value={`₹${(REVENUE_MONTH.completed / 1000).toFixed(0)}k`} />
            <MiniStat label="Pending" value={`₹${(REVENUE_MONTH.pending / 1000).toFixed(0)}k`} />
            <MiniStat label="New" value={String(WEEK_METRICS.newPatients)} />
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5 rounded-3xl p-4 sm:p-5 relative overflow-hidden" style={cardStyle}>
          <CardIllustration kind="grid" color={primary} size={140} className="-right-4 -bottom-4" />
          <SectionHead title="Weekly load" hint="Booked · capacity" to="/schedule" />
          <WeeklyLoadChart />
        </section>

        {/* ─── Patient pulse ─────────────────────────────────────────────  */}
        <section className="col-span-12 rounded-3xl p-4 sm:p-5 relative overflow-hidden" style={cardStyle}>
          <CardIllustration kind="leaf" color={primary} size={180} className="-right-6 -bottom-10" />
          <SectionHead title="Patient pulse" hint="Need attention" to="/patients" />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {pulseShown.map((p) => {
              const risk = p.riskLevel;
              const dot = risk === "high" ? "#DC3B4A" : risk === "elevated" ? "#E08A3C" : risk === "moderate" ? "#C9A66B" : "#8CB9A6";
              return (
                <Link
                  key={p.id}
                  to="/patients/$pid"
                  params={{ pid: p.id }}
                  className="rounded-xl p-3 hover:shadow-sm transition-all pc-reveal"
                  style={{ background: surface2, border: `1px solid ${border}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar patient={p} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px]" style={{ color: ink }}>{p.name}</div>
                      <div className="text-[10px] truncate" style={{ color: muted }}>{p.primaryConcern}</div>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} title={`Risk: ${risk}`} />
                  </div>
                  <PhqSpark values={p.phq9} />
                  <div className="mt-2 flex items-center justify-between text-[10px]" style={{ color: muted }}>
                    <span>PHQ-9 · 6w</span>
                    <span>{p.homework.status === "overdue" ? "Homework overdue" : p.nextSession ? `Next ${fmtDate(p.nextSession)}` : "No follow-up"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          {PATIENTS.length > 3 && (
            <LoadMoreButton
              expanded={showAllPulse}
              hiddenCount={Math.min(8, PATIENTS.length) - 3}
              onClick={() => setShowAllPulse((v) => !v)}
            />
          )}
        </section>

        {/* ─── Quick actions rail ───────────────────────────────────────── */}
        <section className="col-span-12 rounded-3xl p-3" style={cardStyle}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <QuickAction to="/notes"        icon={FileText}       label="New note"        motion="float" />
            <QuickAction to="/sessions"     icon={PlayCircle}     label="Start session"   motion="breathe" />
            <QuickAction to="/patients"     icon={UserPlus}       label="Add patient"     motion="float" />
            <QuickAction to="/availability" icon={Clock}          label="Block time"      motion="tilt" />
            <QuickAction to="/analytics"    icon={BarChart3}      label="Report"          motion="breathe" />
            <QuickAction to="/groups"       icon={MessagesSquare} label="Message group"   motion="float" />
          </div>
        </section>

        {/* ─── Inbox + Peer network ─────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-7 rounded-3xl p-4 sm:p-5 relative overflow-hidden" style={cardStyle}>
          <CardIllustration kind="sun" color={primary} size={140} className="-right-4 -bottom-6" />
          <SectionHead title="Inbox" hint={`${inboxUnread} unread`} to="/inbox" />
          <div className="mt-3 divide-y" style={{ borderColor: border }}>
            {inboxShown.map((m) => {
              const p = getPatient(m.patientId);
              return (
                <div key={m.id} className="py-2.5 flex items-center gap-3 pc-reveal">
                  {p && <Avatar patient={p} size={30} />}
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
          {INBOX.length > 3 && (
            <LoadMoreButton
              expanded={showAllInbox}
              hiddenCount={Math.min(8, INBOX.length) - 3}
              onClick={() => setShowAllInbox((v) => !v)}
            />
          )}
        </section>

        <section className="col-span-12 lg:col-span-5 rounded-3xl p-4 sm:p-5 relative overflow-hidden" style={cardStyle}>
          <CardIllustration kind="bloom" color={primary} size={140} className="-right-4 -bottom-6" />
          <SectionHead title="Peer network" to="/peers" />
          <div className="mt-3 space-y-2.5">
            {peersShown.map((u) => (
              <div key={u.id} className="flex items-start gap-2.5 pc-reveal">
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
          {PEER_UPDATES.length > 3 && (
            <LoadMoreButton
              expanded={showAllPeers}
              hiddenCount={PEER_UPDATES.length - 3}
              onClick={() => setShowAllPeers((v) => !v)}
            />
          )}
        </section>

        {/* ─── Optional: recent notes, hidden behind a single button ───── */}
        <section className="col-span-12 rounded-3xl p-3" style={cardStyle}>
          <button
            onClick={() => setShowNotes((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 text-[11.5px] py-2 rounded-2xl transition-colors hover:bg-black/[0.02]"
            style={{ color: muted }}
          >
            <FileText className="w-3.5 h-3.5" />
            {showNotes ? "Hide recent notes" : `Show ${NOTES.length} recent notes`}
            <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: showNotes ? "rotate(180deg)" : "none" }} />
          </button>
          {showNotes && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pc-reveal">
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
          )}
        </section>

        {/* ─── Footer compliance strip ──────────────────────────────────── */}
        <section className="col-span-12 rounded-3xl p-4 grid grid-cols-2 lg:grid-cols-4 gap-4 relative overflow-hidden" style={cardStyle}>
          <CardIllustration kind="grid" color={primary} size={140} className="-right-4 -bottom-6" />
          <FooterStat icon={GraduationCap} label="CPD this quarter"
            value={`${COMPLIANCE.cpdHoursQuarter} / ${COMPLIANCE.cpdRequired} hrs`}
            progress={COMPLIANCE.cpdHoursQuarter / COMPLIANCE.cpdRequired} />
          <FooterStat icon={MessagesSquare} label="Next supervision"
            value={fmtDate(COMPLIANCE.nextSupervision)}
            sub={`in ${daysUntil(COMPLIANCE.nextSupervision)} days`} />
          <FooterStat icon={ShieldCheck} label="RCI licence"
            value={fmtDate(COMPLIANCE.licenseExpiresAt)}
            sub={`renews in ${daysUntil(COMPLIANCE.licenseExpiresAt)} days`} />
          <FooterStat icon={Wallet} label="DPDP consent"
            value={COMPLIANCE.dpdpConsent === "current" ? "Current" : "Review due"}
            sub="All patient consents on file" />
        </section>
      </div>
    </div>
  );
}

// ── Presentational bits ────────────────────────────────────────────────
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

function LoadMoreButton({ expanded, hiddenCount, onClick }: { expanded: boolean; hiddenCount: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] py-2 rounded-xl transition-colors"
      style={{ background: surface2, color: muted, border: `1px solid ${border}` }}
    >
      {expanded ? "Show less" : `Load ${hiddenCount} more`}
      <ChevronDown className="w-3 h-3 transition-transform" style={{ transform: expanded ? "rotate(180deg)" : "none" }} />
    </button>
  );
}

function RotatingTile({ facets, accent, delayMs = 0 }: { facets: RotatingFacet[]; accent: string; delayMs?: number }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const start = setTimeout(() => {
      setIdx((i) => (i + 1) % facets.length);
    }, delayMs);
    const t = setInterval(() => setIdx((i) => (i + 1) % facets.length), 4200);
    return () => { clearTimeout(start); clearInterval(t); };
  }, [facets.length, delayMs]);
  const f = facets[idx];
  return (
    <section
      className="col-span-6 lg:col-span-3 rounded-2xl p-3 sm:p-4 relative overflow-hidden"
      style={cardStyle}
    >
      <div className="flex items-center justify-between">
        <div className="text-[9.5px] uppercase tracking-[0.2em] truncate" style={{ color: accent }}>{f.label}</div>
        <div className="flex gap-1 shrink-0">
          {facets.map((_, i) => (
            <span key={i} className="w-1 h-1 rounded-full transition-opacity" style={{ background: accent, opacity: i === idx ? 1 : 0.25 }} />
          ))}
        </div>
      </div>
      <div key={idx} className="mt-2 text-[20px] sm:text-[22px] tabular-nums leading-none pc-reveal truncate" style={{ fontFamily: "'Fraunces', serif", color: ink }}>
        {f.value}
      </div>
      {f.sub && <div className="mt-1 text-[10.5px] truncate" style={{ color: muted }}>{f.sub}</div>}
    </section>
  );
}

function Ring({ label, value, pct, color, to }: { label: string; value: string; pct: number; color: string; to: string }) {
  const R = 22, C = 2 * Math.PI * R;
  const dash = C * (Math.min(100, Math.max(0, pct)) / 100);
  return (
    <Link to={to} className="flex flex-col items-center gap-1 group">
      <div className="relative" style={{ width: 60, height: 60 }}>
        <svg viewBox="0 0 60 60" width={60} height={60} className="transition-transform group-hover:scale-105">
          <circle cx="30" cy="30" r={R} stroke={surface2} strokeWidth={5} fill="none" />
          <circle
            cx="30" cy="30" r={R} stroke={color} strokeWidth={5} fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            transform="rotate(-90 30 30)"
            style={{ transition: "stroke-dasharray 500ms cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[12px] tabular-nums" style={{ color: ink, fontFamily: "'Fraunces', serif" }}>{value}</div>
      </div>
      <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: muted }}>{label}</span>
    </Link>
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

function QuickAction({ to, icon: Icon, label, motion }: { to: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; motion: "float" | "breathe" | "tilt" }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors hover:bg-black/[0.02]"
      style={{ background: surface2, border: `1px solid ${border}`, color: ink }}
    >
      <AnimatedIcon icon={Icon} motion={motion} bg={soft} color={primary} size={14} padded />
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
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, progress * 100)}%`, background: primary, transition: "width 500ms ease-out" }} />
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

// ── Chart tooltip shared style (tap-friendly on touch) ─────
function useTipTrigger(): "hover" | "click" {
  return useIsTouch() ? "click" : "hover";
}
function TipBox({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-2.5 py-1.5 text-[11px] shadow-md" style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
      {label != null && <div className="text-[10px] mb-0.5" style={{ color: muted }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color || p.fill || primary }} />
          <span style={{ color: muted }}>{p.name}</span>
          <span>{p.value}{unit || ""}</span>
        </div>
      ))}
    </div>
  );
}

function PhqSpark({ values }: { values: number[] }) {
  const trigger = useTipTrigger();
  const rising = values[values.length - 1] > values[0];
  const stroke = rising ? "#DC3B4A" : "#1F7A3E";
  const data = values.map((v, i) => ({ week: `W${i + 1}`, score: v }));
  return (
    <div className="w-full h-9 -mx-1">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 2, right: 4, bottom: 0, left: 4 }}>
          <Tooltip trigger={trigger} cursor={{ stroke: border }} content={<TipBox unit="" />} wrapperStyle={{ outline: "none" }} />
          <Line type="monotone" dataKey="score" name="PHQ-9" stroke={stroke} strokeWidth={2} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AreaSpark({ values }: { values: number[] }) {
  const trigger = useTipTrigger();
  const data = values.map((v, i) => ({ day: `D${i + 1}`, revenue: v }));
  return (
    <div className="flex-1 h-16 min-w-0">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="dashRevFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary} stopOpacity={0.35} />
              <stop offset="100%" stopColor={primary} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Tooltip trigger={trigger} cursor={{ stroke: border }} content={<TipBox />} wrapperStyle={{ outline: "none" }} />
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke={primary} strokeWidth={2} fill="url(#dashRevFill)" activeDot={{ r: 3 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function WeeklyLoadChart() {
  const trigger = useTipTrigger();
  const data = WEEKLY_LOAD.map((d) => ({
    day: d.day,
    booked: d.booked,
    free: Math.max(0, d.capacity - d.booked),
    capacity: d.capacity,
  }));
  return (
    <div className="mt-4 w-full h-32">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -20 }} barCategoryGap="22%">
          <CartesianGrid stroke={border} strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: muted }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            trigger={trigger}
            cursor={{ fill: soft, opacity: 0.6 }}
            content={({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload;
              return (
                <div className="rounded-lg px-2.5 py-1.5 text-[11px] shadow-md" style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                  <div className="text-[10px] mb-0.5" style={{ color: muted }}>{label}</div>
                  <div className="tabular-nums">{row.booked}/{row.capacity} booked</div>
                  <div className="tabular-nums" style={{ color: muted }}>{row.free} open</div>
                </div>
              );
            }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey="booked" stackId="a" fill={primary} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="free" stackId="a" fill={surface2} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Silence unused-import lint until INTAKES makes it back onto the board.
void INTAKES;
