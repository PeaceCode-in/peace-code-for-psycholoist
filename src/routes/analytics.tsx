import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,

  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, palette } from "@/components/practice/AppShell";
import { useLiveSessions } from "@/lib/sessions-store";
import { useLivePatients } from "@/lib/patients-store";
import { useLiveNotes } from "@/lib/notes-store";
import {
  getRevenueByMonth,
  getCollectionRate,
  getRevenueThisMonth,
  formatINR,
} from "@/lib/billing-store";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Video,
  FileSignature,
  IndianRupee,
  ChevronRight,
  Info,
  BarChart3,
  LineChart as LineIcon,
  AreaChart as AreaIcon,
  PieChart as PieIcon,
  Inbox,
} from "lucide-react";

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

type RevenueView = "bar" | "line" | "area";
type ModalityView = "bars" | "donut";

// Chart palette — pulls semantic tokens so dark mode inverts automatically.
const CHART = {
  primary: "hsl(var(--primary, 220 65% 51%)) ",
  ink: "var(--foreground)",
  muted: "var(--muted-foreground)",
  grid: "color-mix(in oklab, var(--foreground) 12%, transparent)",
  card: "var(--card)",
  border: "var(--border)",
  series: [
    "var(--primary)",
    "#7BA88A",
    "#C2A97E",
    "#A48CC7",
    "#E88A6A",
  ],
};

function AnalyticsPage() {
  const [range, setRange] = useState<Range>("90d");
  const [revView, setRevView] = useState<RevenueView>("bar");
  const [modView, setModView] = useState<ModalityView>("bars");

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
  // Multi-series revenue: one column per service, per month → interactive legend
  const services = useMemo(() => {
    const set = new Set<string>();
    months.forEach((m) => Object.keys(m.byService).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [months]);
  const revenueData = months.map((m) => {
    const row: Record<string, number | string> = { month: m.month, revenue: m.total };
    for (const svc of services) row[svc] = Math.round(m.byService[svc] ?? 0);
    return row;
  });
  const revenueEmpty = revenueData.every((d) => (d.revenue as number) === 0);
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const toggleSeries = (key: string) =>
    setHiddenSeries((h) => ({ ...h, [key]: !h[key] }));


  const stableOrBetter = patients.filter((p) => p.status === "active" && (p.risk === "stable" || p.risk === "monitor")).length;
  const outcomeScore = activePatients ? Math.round((stableOrBetter / activePatients) * 100) : 0;

  const modality = {
    telehealth: inRange.filter((s) => s.modality === "telehealth").length,
    in_person: inRange.filter((s) => s.modality === "in_person").length,
    phone: inRange.filter((s) => s.modality === "phone").length,
  };
  const modalityData = [
    { name: "Telehealth", value: modality.telehealth, fill: CHART.series[0] },
    { name: "In-person", value: modality.in_person, fill: CHART.series[1] },
    { name: "Phone", value: modality.phone, fill: CHART.series[2] },
  ];
  const modalityEmpty = modalityData.every((d) => d.value === 0);
  const [hiddenSlices, setHiddenSlices] = useState<Record<string, boolean>>({});
  const visibleModality = modalityData.filter((d) => !hiddenSlices[d.name]);


  return (
    <AppShell crumb="Analytics">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between mb-6">
          <div className="min-w-0">
            <div
              className="uppercase text-[10.5px] tracking-[0.22em]"
              style={{ color: "var(--muted-foreground)", fontFamily: "'DM Mono', ui-monospace, monospace" }}
            >
              Growth · Analytics
            </div>
            <h1
              className="mt-1 text-[26px] leading-tight tracking-tight truncate"
              style={{ fontFamily: "'Fraunces', serif", color: "var(--foreground)" }}
            >
              How the practice is really doing
            </h1>
            <p className="text-[13px] mt-1" style={{ color: "var(--muted-foreground)" }}>
              Live from your sessions, patients, notes, and billing — no re-entry.
            </p>
          </div>
          <SegmentedPill
            value={range}
            onChange={(v) => setRange(v as Range)}
            options={[
              { value: "30d", label: "30 days" },
              { value: "90d", label: "90 days" },
              { value: "12m", label: "12 months" },
            ]}
          />
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon={IndianRupee} label="Revenue this month" value={formatINR(rev.current)} delta={rev.delta}
            hint={`vs ${formatINR(rev.previous)} last month`} />
          <Kpi icon={Users} label="Active patients" value={String(activePatients)} delta={newPatients} deltaSuffix=" new"
            hint={`${dischargedInRange} discharged in range`} />
          <Kpi icon={Video} label="Session completion" value={`${completionRate}%`} delta={-noShowRate} deltaSuffix="% no-show"
            hint={`${completed} completed · ${cancelled} cancelled`} />
          <Kpi icon={FileSignature} label="Notes signed" value={String(signed)} delta={unsigned} deltaSuffix=" unsigned"
            hint={`Collection rate ${collect}%`} />
        </div>

        {/* Revenue trend */}
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div>
              <div className="text-[13.5px]" style={{ color: "var(--foreground)" }}>Revenue trend</div>
              <div className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>Paid invoices by month · same data, three views</div>
            </div>
            <div className="flex items-center gap-2">
              <SegmentedPill
                value={revView}
                onChange={(v) => setRevView(v as RevenueView)}
                options={[
                  { value: "bar", label: "Bars", icon: BarChart3 },
                  { value: "line", label: "Line", icon: LineIcon },
                  { value: "area", label: "Area", icon: AreaIcon },
                ]}
              />
              <Link
                to="/billing"
                className="text-[11.5px] flex items-center gap-1 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Full report <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {revenueEmpty ? (
            <EmptyChart
              icon={IndianRupee}
              title="No revenue yet in this range"
              hint="Once invoices are marked paid they'll trend here in rupees."
            />
          ) : (
            <>
              {/* Interactive series legend — click to toggle */}
              {services.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {services.map((svc, i) => {
                    const color = CHART.series[i % CHART.series.length];
                    const hidden = !!hiddenSeries[svc];
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleSeries(svc)}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-all hover:scale-[1.03] active:scale-[0.98]"
                        style={{
                          background: hidden ? "transparent" : "color-mix(in oklab, var(--muted) 70%, transparent)",
                          border: "1px solid var(--border)",
                          color: hidden ? "var(--muted-foreground)" : "var(--foreground)",
                          opacity: hidden ? 0.55 : 1,
                          textDecoration: hidden ? "line-through" : "none",
                        }}
                        aria-pressed={!hidden}
                        title={hidden ? `Show ${svc}` : `Hide ${svc}`}
                      >
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        {svc}
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={{ height: 240 }}>
                <ResponsiveContainer>
                  {revView === "bar" ? (
                    <BarChart data={revenueData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: CHART.muted, fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.muted, fontSize: 11 }}
                        tickFormatter={(v) => formatINR(v as number, { decimals: false })} width={72} />
                      <Tooltip content={<ChartTooltip formatter={(v) => formatINR(v as number)} />} cursor={{ fill: CHART.grid }} />
                      {services.length > 1 ? (
                        services.map((svc, i) =>
                          hiddenSeries[svc] ? null : (
                            <Bar
                              key={svc}
                              dataKey={svc}
                              stackId="rev"
                              fill={CHART.series[i % CHART.series.length]}
                              radius={i === services.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                              animationDuration={650}
                              onClick={() => toggleSeries(svc)}
                              cursor="pointer"
                            />
                          )
                        )
                      ) : (
                        <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} animationDuration={650} />
                      )}
                    </BarChart>
                  ) : revView === "line" ? (
                    <LineChart data={revenueData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: CHART.muted, fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.muted, fontSize: 11 }}
                        tickFormatter={(v) => formatINR(v as number, { decimals: false })} width={72} />
                      <Tooltip content={<ChartTooltip formatter={(v) => formatINR(v as number)} />} cursor={{ stroke: CHART.grid }} />
                      {services.length > 1 ? (
                        services.map((svc, i) =>
                          hiddenSeries[svc] ? null : (
                            <Line
                              key={svc}
                              type="monotone"
                              dataKey={svc}
                              stroke={CHART.series[i % CHART.series.length]}
                              strokeWidth={2.5}
                              dot={{ r: 3.5, strokeWidth: 0, fill: CHART.series[i % CHART.series.length] }}
                              activeDot={{ r: 6, onClick: () => toggleSeries(svc) }}
                              animationDuration={650}
                            />
                          )
                        )
                      ) : (
                        <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5}
                          dot={{ r: 4, fill: "var(--primary)" }} activeDot={{ r: 6 }} animationDuration={650} />
                      )}
                    </LineChart>
                  ) : (
                    <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        {(services.length > 1 ? services : ["revenue"]).map((svc, i) => (
                          <linearGradient key={svc} id={`revFill-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={services.length > 1 ? CHART.series[i % CHART.series.length] : "var(--primary)"} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={services.length > 1 ? CHART.series[i % CHART.series.length] : "var(--primary)"} stopOpacity={0.02} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: CHART.muted, fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.muted, fontSize: 11 }}
                        tickFormatter={(v) => formatINR(v as number, { decimals: false })} width={72} />
                      <Tooltip content={<ChartTooltip formatter={(v) => formatINR(v as number)} />} cursor={{ stroke: CHART.grid }} />
                      {services.length > 1 ? (
                        services.map((svc, i) =>
                          hiddenSeries[svc] ? null : (
                            <Area
                              key={svc}
                              type="monotone"
                              dataKey={svc}
                              stackId="rev"
                              stroke={CHART.series[i % CHART.series.length]}
                              strokeWidth={2}
                              fill={`url(#revFill-${i})`}
                              animationDuration={650}
                            />
                          )
                        )
                      ) : (
                        <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#revFill-0)" animationDuration={650} />
                      )}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </>
          )}

        </Card>

        {/* Two-up */}
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <Card>
            <div className="text-[13.5px] mb-1" style={{ color: "var(--foreground)" }}>Outcomes</div>
            <div className="text-[11.5px] mb-4" style={{ color: "var(--muted-foreground)" }}>
              Share of active patients at stable or monitor risk
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-[38px] tabular-nums leading-none"
                style={{ fontFamily: "'Fraunces', serif", color: "var(--foreground)" }}>{outcomeScore}%</div>
              <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                {stableOrBetter} of {activePatients} active
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Retention" value={`${retention}%`} />
              <MiniStat label="New intakes" value={String(newPatients)} />
              <MiniStat label="Discharged" value={String(dischargedInRange)} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
              <div>
                <div className="text-[13.5px]" style={{ color: "var(--foreground)" }}>Modality mix</div>
                <div className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>Sessions delivered in range</div>
              </div>
              <SegmentedPill
                value={modView}
                onChange={(v) => setModView(v as ModalityView)}
                options={[
                  { value: "bars", label: "Bars", icon: BarChart3 },
                  { value: "donut", label: "Donut", icon: PieIcon },
                ]}
              />
            </div>

            {modalityEmpty ? (
              <EmptyChart icon={Video} title="No sessions in this range" hint="Delivered sessions will appear here." />
            ) : (
              <>
                {/* Clickable legend chips — toggle slice / bar */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {modalityData.map((d) => {
                    const hidden = !!hiddenSlices[d.name];
                    return (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => setHiddenSlices((h) => ({ ...h, [d.name]: !h[d.name] }))}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-all hover:scale-[1.03] active:scale-[0.98]"
                        style={{
                          background: hidden ? "transparent" : "color-mix(in oklab, var(--muted) 70%, transparent)",
                          border: "1px solid var(--border)",
                          color: hidden ? "var(--muted-foreground)" : "var(--foreground)",
                          opacity: hidden ? 0.55 : 1,
                          textDecoration: hidden ? "line-through" : "none",
                        }}
                        aria-pressed={!hidden}
                      >
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                        {d.name} <span className="tabular-nums opacity-70">· {d.value}</span>
                      </button>
                    );
                  })}
                </div>

                {modView === "donut" ? (
                  <div style={{ height: 200 }} className="mt-2">
                    <ResponsiveContainer>
                      <PieChart>
                        <Tooltip content={<ChartTooltip />} />
                        <Pie
                          data={visibleModality.length ? visibleModality : modalityData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={48}
                          outerRadius={78}
                          paddingAngle={2}
                          stroke="var(--card)"
                          animationDuration={650}
                          onClick={(e: { name?: string }) =>
                            e?.name && setHiddenSlices((h) => ({ ...h, [e.name!]: !h[e.name!] }))
                          }
                          cursor="pointer"
                        >
                          {(visibleModality.length ? visibleModality : modalityData).map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: 180 }} className="mt-2">
                    <ResponsiveContainer>
                      <BarChart
                        data={visibleModality.length ? visibleModality : modalityData}
                        layout="vertical"
                        margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                      >
                        <CartesianGrid stroke={CHART.grid} horizontal={false} />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: CHART.muted, fontSize: 11 }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: CHART.muted, fontSize: 11 }}
                          width={80}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: CHART.grid }} />
                        <Bar
                          dataKey="value"
                          radius={[0, 6, 6, 0]}
                          animationDuration={650}
                          onClick={(e: { name?: string }) =>
                            e?.name && setHiddenSlices((h) => ({ ...h, [e.name!]: !h[e.name!] }))
                          }
                          cursor="pointer"
                        >
                          {(visibleModality.length ? visibleModality : modalityData).map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}


            <div className="mt-3 pt-3 text-[11.5px] flex items-center gap-1.5"
              style={{ color: "var(--muted-foreground)", borderTop: "1px solid var(--border)" }}>
              <Info className="w-3 h-3" /> Modality mix influences no-show risk — phone tends to run 8–12% higher.
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

/* -------------------- Presentation primitives -------------------- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, delta, deltaSuffix = "%", hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; delta: number; deltaSuffix?: string; hint: string;
}) {
  const positive = delta >= 0;
  const Arrow = positive ? TrendingUp : TrendingDown;
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="mt-2 text-[24px] tabular-nums leading-none"
        style={{ fontFamily: "'Fraunces', serif", color: "var(--foreground)" }}>{value}</div>
      <div
        className="mt-2 flex items-center gap-1.5 text-[11.5px]"
        style={{ color: positive ? "color-mix(in oklab, var(--foreground) 20%, #3F7A55)" : "color-mix(in oklab, var(--foreground) 15%, #B54848)" }}
      >
        <Arrow className="w-3 h-3" /> {positive ? "+" : ""}{delta}{deltaSuffix}
      </div>
      <div className="mt-1 text-[10.5px]" style={{ color: "var(--muted-foreground)" }}>{hint}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-2 py-3" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
      <div className="text-[16px] tabular-nums" style={{ color: "var(--foreground)" }}>{value}</div>
      <div className="text-[10.5px]" style={{ color: "var(--muted-foreground)" }}>{label}</div>
    </div>
  );
}

function SegmentedPill<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <div
      className="inline-flex rounded-full p-0.5 shrink-0"
      style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
    >
      {options.map((o) => {
        const active = value === o.value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="text-[12px] h-8 px-3 rounded-full transition-colors inline-flex items-center gap-1.5"
            style={{
              background: active ? "var(--card)" : "transparent",
              color: active ? "var(--foreground)" : "var(--muted-foreground)",
              boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
            aria-pressed={active}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyChart({
  icon: Icon = Inbox,
  title,
  hint,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-xl flex flex-col items-center justify-center text-center px-6 py-10 gap-2"
      style={{
        background: "color-mix(in oklab, var(--muted) 60%, transparent)",
        border: "1px dashed var(--border)",
        minHeight: 200,
      }}
    >
      <div
        className="w-9 h-9 rounded-full grid place-items-center"
        style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[13px]" style={{ color: "var(--foreground)" }}>{title}</div>
      {hint && <div className="text-[11.5px] max-w-xs" style={{ color: "var(--muted-foreground)" }}>{hint}</div>}
    </div>
  );
}

/* Recharts tooltip that reads semantic tokens — inverts cleanly in dark mode. */
function ChartTooltip({
  active, payload, label, formatter,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; payload?: { name?: string; fill?: string } }>;
  label?: string | number;
  formatter?: (v: number | string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-[11.5px] shadow-lg"
      style={{
        background: "var(--card)",
        color: "var(--card-foreground)",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 24px -12px rgba(0,0,0,0.35)",
      }}
    >
      {label !== undefined && (
        <div className="uppercase tracking-wider text-[10px] mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
      )}
      {payload.map((p, i) => {
        const color = p.color || p.payload?.fill || "var(--primary)";
        const name = p.name || p.payload?.name || "value";
        const val = p.value ?? "";
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
            <span style={{ color: "var(--muted-foreground)" }}>{name}</span>
            <span className="ml-auto tabular-nums" style={{ color: "var(--foreground)" }}>
              {formatter ? formatter(val as number) : val}
            </span>
          </div>
        );
      })}
    </div>
  );
}
