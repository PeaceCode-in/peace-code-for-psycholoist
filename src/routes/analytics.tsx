import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, palette } from "@/components/practice/AppShell";
import { useLiveSessions } from "@/lib/sessions-store";
import { useLivePatients } from "@/lib/patients-store";
import { useLiveNotes } from "@/lib/notes-store";
import { getRevenueByMonth, getCollectionRate, getRevenueThisMonth, formatINR } from "@/lib/billing-store";
import { TrendingUp, TrendingDown, Users, Video, FileSignature, IndianRupee, ChevronRight, Info } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — PeaceCode · Practice" },
      { name: "description", content: "Outcomes, retention, no-show rate, and revenue over time." },
    ],
  }),
  component: AnalyticsPage,
});

type Range = "30d" | "90d" | "12m";
const RANGE_DAYS: Record<Range, number> = { "30d": 30, "90d": 90, "12m": 365 };

function AnalyticsPage() {
  const [range, setRange] = useState<Range>("90d");
  const sessions = useLiveSessions();
  const patients = useLivePatients();
  const notes = useLiveNotes();

  const cutoff = Date.now() - RANGE_DAYS[range] * 86_400_000;

  const inRange = useMemo(
    () => sessions.filter((s) => new Date(s.startsAt).getTime() >= cutoff),
    [sessions, cutoff],
  );

  const completed = inRange.filter((s) => s.status === "completed").length;
  const noShow = inRange.filter((s) => s.status === "no_show").length;
  const cancelled = inRange.filter((s) => s.status === "cancelled").length;
  const total = inRange.length || 1;
  const noShowRate = Math.round((noShow / total) * 100);
  const completionRate = Math.round((completed / total) * 100);

  const activePatients = patients.filter((p) => p.status === "active").length;
  const newPatients = patients.filter((p) => p.intakeDate >= cutoff).length;
  const dischargedInRange = patients.filter((p) => p.status === "discharged" && p.updatedAt >= cutoff).length;
  const retention = activePatients + dischargedInRange > 0
    ? Math.round((activePatients / (activePatients + dischargedInRange)) * 100)
    : 100;

  const signed = notes.filter((n) => n.status === "signed" && n.updatedAt >= cutoff).length;
  const unsigned = notes.filter((n) => n.status === "draft").length;

  const rev = getRevenueThisMonth();
  const collect = getCollectionRate(30);
  const months = getRevenueByMonth(range === "12m" ? 12 : range === "90d" ? 3 : 1);
  const maxRev = Math.max(1, ...months.map((m) => m.total));

  // Outcome proxy — % of active patients whose risk trended down or held stable.
  const stableOrBetter = patients.filter((p) => p.status === "active" && (p.risk === "stable" || p.risk === "monitor")).length;
  const outcomeScore = activePatients ? Math.round((stableOrBetter / activePatients) * 100) : 0;

  const modality = {
    telehealth: inRange.filter((s) => s.modality === "telehealth").length,
    in_person: inRange.filter((s) => s.modality === "in_person").length,
    phone: inRange.filter((s) => s.modality === "phone").length,
  };
  const modalityTotal = modality.telehealth + modality.in_person + modality.phone || 1;

  return (
    <AppShell crumb="Analytics">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between mb-6">
          <div className="min-w-0">
            <div className="uppercase text-[10.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Growth · Analytics</div>
            <h1 className="mt-1 text-[26px] leading-tight tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              How the practice is really doing
            </h1>
            <p className="text-[13px] mt-1" style={{ color: palette.muted }}>
              Live from your sessions, patients, notes, and billing — no re-entry.
            </p>
          </div>
          <div className="inline-flex rounded-full p-0.5 shrink-0" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
            {(["30d", "90d", "12m"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="text-[12px] h-8 px-3 rounded-full transition-colors"
                style={{
                  background: range === r ? "#fff" : "transparent",
                  color: range === r ? palette.ink : palette.muted,
                  boxShadow: range === r ? "0 1px 2px rgba(30,20,24,0.05)" : "none",
                }}
              >{r === "30d" ? "30 days" : r === "90d" ? "90 days" : "12 months"}</button>
            ))}
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi
            icon={IndianRupee}
            label="Revenue this month"
            value={formatINR(rev.current)}
            delta={rev.delta}
            hint={`vs ${formatINR(rev.previous)} last month`}
          />
          <Kpi
            icon={Users}
            label="Active patients"
            value={String(activePatients)}
            delta={newPatients}
            deltaSuffix=" new"
            hint={`${dischargedInRange} discharged in range`}
          />
          <Kpi
            icon={Video}
            label="Session completion"
            value={`${completionRate}%`}
            delta={-noShowRate}
            deltaSuffix="% no-show"
            hint={`${completed} completed · ${cancelled} cancelled`}
          />
          <Kpi
            icon={FileSignature}
            label="Notes signed"
            value={String(signed)}
            delta={unsigned}
            deltaSuffix=" unsigned"
            hint={`Collection rate ${collect}%`}
          />
        </div>

        {/* Revenue trend */}
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13.5px]" style={{ color: palette.ink }}>Revenue trend</div>
              <div className="text-[11.5px]" style={{ color: palette.muted }}>Paid invoices by month</div>
            </div>
            <Link to="/billing/reports" className="text-[11.5px] flex items-center gap-1 hover:underline" style={{ color: palette.primary }}>
              Full report <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}>
            {months.map((m) => {
              const h = Math.max(6, Math.round((m.total / maxRev) * 140));
              return (
                <div key={m.monthISO} className="flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: 140 }}>
                    <div
                      className="w-6 sm:w-10 rounded-t-md transition-all"
                      style={{ height: h, background: palette.primary, opacity: 0.85 }}
                      title={`${m.month} · ${formatINR(m.total)}`}
                    />
                  </div>
                  <div className="text-[10.5px] uppercase tracking-wider" style={{ color: palette.muted }}>{m.month}</div>
                  <div className="text-[11px] tabular-nums" style={{ color: palette.ink }}>{formatINR(m.total, { decimals: false })}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Two-up */}
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <Card>
            <div className="text-[13.5px] mb-1" style={{ color: palette.ink }}>Outcomes</div>
            <div className="text-[11.5px] mb-4" style={{ color: palette.muted }}>Mood lift per note (post − pre, 1–10 scale)</div>
            <div className="flex items-baseline gap-2">
              <div className="text-[38px] tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{avgMoodLift}</div>
              <div className="text-[12px]" style={{ color: palette.muted }}>points, {moodDeltas.length} paired ratings</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Retention" value={`${retention}%`} />
              <MiniStat label="New intakes" value={String(newPatients)} />
              <MiniStat label="Discharged" value={String(dischargedInRange)} />
            </div>
          </Card>
          <Card>
            <div className="text-[13.5px] mb-1" style={{ color: palette.ink }}>Modality mix</div>
            <div className="text-[11.5px] mb-4" style={{ color: palette.muted }}>Sessions delivered in range</div>
            <div className="space-y-3">
              <Bar label="Telehealth" value={modality.telehealth} total={modalityTotal} color={palette.primary} />
              <Bar label="In-person" value={modality.in_person} total={modalityTotal} color="#7BA88A" />
              <Bar label="Phone" value={modality.phone} total={modalityTotal} color="#C2A97E" />
            </div>
            <div className="mt-4 pt-3 text-[11.5px] flex items-center gap-1.5" style={{ color: palette.muted, borderTop: `1px solid ${palette.border}` }}>
              <Info className="w-3 h-3" /> Modality mix influences no-show risk — phone tends to run 8–12% higher.
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "#fff", border: `1px solid ${palette.border}` }}>{children}</div>
  );
}
function Kpi({ icon: Icon, label, value, delta, deltaSuffix = "%", hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; delta: number; deltaSuffix?: string; hint: string }) {
  const positive = delta >= 0;
  const Arrow = positive ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider" style={{ color: palette.muted }}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="mt-2 text-[24px] tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</div>
      <div className="mt-2 flex items-center gap-1.5 text-[11.5px]" style={{ color: positive ? "#3F7A55" : "#B54848" }}>
        <Arrow className="w-3 h-3" /> {positive ? "+" : ""}{delta}{deltaSuffix}
      </div>
      <div className="mt-1 text-[10.5px]" style={{ color: palette.muted }}>{hint}</div>
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-2 py-3" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
      <div className="text-[16px] tabular-nums" style={{ color: palette.ink }}>{value}</div>
      <div className="text-[10.5px]" style={{ color: palette.muted }}>{label}</div>
    </div>
  );
}
function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12px]">
        <span style={{ color: palette.ink }}>{label}</span>
        <span className="tabular-nums" style={{ color: palette.muted }}>{value} · {pct}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full overflow-hidden" style={{ background: palette.surface2 }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
