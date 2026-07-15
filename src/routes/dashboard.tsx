import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, palette } from "@/components/practice/AppShell";
import {
  Video, MapPin, Phone, ArrowUpRight, AlertTriangle,
  MessageCircle, TrendingUp, CheckCircle2, XCircle,
} from "lucide-react";
import {
  SESSIONS_TODAY, ALERTS, PATIENTS, NOTES, INTAKES, WEEKLY_LOAD,
  REVENUE_SPARK, REVENUE_MONTH, getPatient,
} from "@/lib/practice-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PeaceCode · Practice" },
      { name: "description", content: "Today's schedule, patient alerts, and practice health at a glance." },
    ],
  }),
  component: () => <AppShell crumb="Dashboard"><Dashboard /></AppShell>,
});

const { surface, surface2, border, ink, muted, primary, soft } = palette;
const cardStyle = { background: surface, border: `1px solid ${border}` } as const;

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const fmtDay = () => new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

function Dashboard() {
  const bookedToday = SESSIONS_TODAY.reduce((sum, s) => sum + s.fee, 0);
  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-6 lg:py-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[clamp(1.6rem,2.4vw,2rem)] tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif", color: ink }}>{greeting()}, Dr. Sharma</h1>
          <p className="text-[12.5px] mt-1" style={{ color: muted }}>{fmtDay()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Stat label="sessions" value={String(SESSIONS_TODAY.length)} />
          <Stat label="new intakes" value={String(INTAKES.length)} />
          <Stat label="booked today" value={`₹${bookedToday.toLocaleString("en-IN")}`} accent />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12 lg:col-span-8 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Today's schedule" hint={`${SESSIONS_TODAY.length} sessions`} to="/schedule" />
          <div className="mt-4 divide-y" style={{ borderColor: border }}>
            {SESSIONS_TODAY.map((s) => {
              const p = getPatient(s.patientId);
              const Icon = s.modality === "video" ? Video : s.modality === "in-person" ? MapPin : Phone;
              return (
                <div key={s.id} className="py-3 flex items-center gap-3">
                  <div className="text-[12px] tabular-nums w-16 shrink-0" style={{ color: ink }}>{fmtTime(s.startsAt)}</div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] text-white shrink-0" style={{ background: primary }}>{p?.initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] truncate" style={{ color: ink }}>{p?.name}</div>
                    <div className="text-[11px] flex items-center gap-1.5" style={{ color: muted }}>
                      <Icon className="w-3 h-3" /> {s.type} · {s.minutes} min
                    </div>
                  </div>
                  <button className="text-[11px] px-3 py-1.5 rounded-full" style={{ background: ink, color: "#fff" }}>
                    {s.modality === "in-person" ? "Check in" : "Join"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Alerts" hint={`${ALERTS.length} active`} to="/patients" />
          <div className="mt-4 space-y-2.5">
            {ALERTS.map((a) => {
              const p = getPatient(a.patientId);
              const tone = a.priority === "high" ? { bg: "#FDECEC", ink: "#B54848", bd: "#F3C7C7" }
                : a.priority === "medium" ? { bg: soft, ink: primary, bd: border }
                : { bg: surface2, ink: muted, bd: border };
              return (
                <div key={a.id} className="rounded-xl p-3" style={{ background: tone.bg, border: `1px solid ${tone.bd}` }}>
                  <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em]" style={{ color: tone.ink }}>
                    <AlertTriangle className="w-3 h-3" /> {a.kind.replace("-", " ")}
                  </div>
                  <div className="text-[12.5px] mt-1" style={{ color: ink }}>{a.message}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: muted }}>{p?.name}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Needs follow-up" hint="Overdue since last session" to="/patients" />
          <div className="mt-3 divide-y" style={{ borderColor: border }}>
            {PATIENTS.filter((p) => p.lastSession).slice(0, 5).map((p) => (
              <div key={p.id} className="py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] text-white" style={{ background: primary }}>{p.initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px]" style={{ color: ink }}>{p.name}</div>
                  <div className="text-[11px]" style={{ color: muted }}>last seen {new Date(p.lastSession!).toLocaleDateString([], { month: "short", day: "numeric" })} · {p.primaryConcern}</div>
                </div>
                <button className="text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: surface2, color: ink, border: `1px solid ${border}` }}>
                  <MessageCircle className="w-3 h-3" />Message
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Revenue · this month" hint="INR" to="/billing" />
          <div className="mt-4 flex items-end gap-4">
            <div>
              <div className="text-[26px] leading-none tabular-nums" style={{ fontFamily: "'Fraunces', serif", color: ink }}>₹{(REVENUE_MONTH.completed / 1000).toFixed(0)}k</div>
              <div className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "#1F7A3E" }}><TrendingUp className="w-3 h-3" /> +14% vs last month</div>
            </div>
            <Spark values={REVENUE_SPARK} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Booked" value={`₹${(REVENUE_MONTH.booked / 1000).toFixed(0)}k`} />
            <MiniStat label="Completed" value={`₹${(REVENUE_MONTH.completed / 1000).toFixed(0)}k`} />
            <MiniStat label="Pending" value={`₹${(REVENUE_MONTH.pending / 1000).toFixed(0)}k`} />
          </div>
        </section>

        <section className="col-span-12 lg:col-span-3 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Recent notes" to="/notes" />
          <div className="mt-3 space-y-3">
            {NOTES.map((n) => {
              const p = getPatient(n.patientId);
              return (
                <div key={n.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9.5px] text-white" style={{ background: primary }}>{p?.initials}</div>
                    <div className="text-[11.5px]" style={{ color: ink }}>{p?.name}</div>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded" style={{ background: surface2, color: muted }}>{n.format}</span>
                  </div>
                  <p className="text-[11.5px] mt-1 leading-snug line-clamp-2" style={{ color: muted }}>{n.summary}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-6 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="Weekly load" hint="Booked vs open slots" to="/schedule" />
          <div className="mt-4 flex items-end gap-3 h-32">
            {WEEKLY_LOAD.map((d) => {
              const pct = d.capacity ? (d.booked / d.capacity) * 100 : 0;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-md relative" style={{ background: surface2, height: "100%" }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-md" style={{ background: primary, height: `${pct}%`, opacity: pct ? 1 : 0.15 }} />
                  </div>
                  <div className="text-[10px]" style={{ color: muted }}>{d.day}</div>
                  <div className="text-[10px] tabular-nums" style={{ color: ink }}>{d.booked}/{d.capacity}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-6 rounded-2xl p-5" style={cardStyle}>
          <SectionHead title="New intake requests" hint={`${INTAKES.length} pending`} to="/patients" />
          <div className="mt-3 space-y-2.5">
            {INTAKES.map((i) => (
              <div key={i.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: surface2, border: `1px solid ${border}` }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] text-white shrink-0" style={{ background: primary }}>{i.initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px]" style={{ color: ink }}>{i.name} · <span style={{ color: muted }}>{i.age}</span></div>
                  <div className="text-[11px]" style={{ color: muted }}>{i.reason} · {i.preferred}</div>
                </div>
                <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#E7F6EC", color: "#1F7A3E" }} aria-label="Accept"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: surface, color: muted, border: `1px solid ${border}` }} aria-label="Decline"><XCircle className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHead({ title, hint, to }: { title: string; hint?: string; to?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[10.5px] tracking-[0.24em] uppercase" style={{ color: primary }}>{title}</div>
        {hint && <div className="text-[11px] mt-0.5" style={{ color: muted }}>{hint}</div>}
      </div>
      {to && <Link to={to} className="text-[11px] flex items-center gap-0.5" style={{ color: muted }}>View <ArrowUpRight className="w-3 h-3" /></Link>}
    </div>
  );
}
function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3 py-2 rounded-xl" style={{ background: accent ? soft : surface, border: `1px solid ${border}` }}>
      <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: muted }}>{label}</div>
      <div className="text-[15px] tabular-nums" style={{ color: ink, fontFamily: "'Fraunces', serif" }}>{value}</div>
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
function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="flex-1 h-14">
      <polyline points={pts} fill="none" stroke={primary} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
