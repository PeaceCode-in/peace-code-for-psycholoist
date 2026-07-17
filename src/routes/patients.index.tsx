import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, ChevronRight, Users, UserPlus, ShieldAlert, Sparkles } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { MentalHealthIllustration } from "@/components/practice/MentalHealthIllustration";
import { AnimatedIcon } from "@/components/practice/AnimatedIcon";
import { Button, Card, EmptyState, Pill, RiskBadge, StatusBadge, TextInput, SectionLabel, fmtDate } from "@/components/practice/patients/primitives";
import { useLivePatients, patientStats, avatarUrl, type PatientStatus, type RiskLevel } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/patients/")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "Patients — PeaceCode · Practice" },
      { name: "description", content: "Your caseload — active clients, waitlist, risk flags, and clinical timeline in one place." },
    ],
  }),
  component: PatientsIndex,
});

type SortKey = "updated" | "name" | "next" | "sessions";

function PatientsIndex() {
  const hydrated = useHydrated();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PatientStatus | "all">("all");
  const [risk, setRisk] = useState<RiskLevel | "all">("all");
  const [sort, setSort] = useState<SortKey>("updated");

  const patients = useLivePatients({ status, risk, search });
  const sorted = useMemo(() => {
    const arr = [...patients];
    switch (sort) {
      case "name": return arr.sort((a, b) => a.fullName.localeCompare(b.fullName));
      case "next": return arr.sort((a, b) => (a.nextSessionAt ?? Infinity) - (b.nextSessionAt ?? Infinity));
      case "sessions": return arr.sort((a, b) => b.totalSessions - a.totalSessions);
      default: return arr;
    }
  }, [patients, sort]);

  const stats = hydrated ? patientStats() : { total: 0, active: 0, waitlist: 0, elevatedRisk: 0, newThisMonth: 0, avgSessionsPerPatient: 0 };

  return (
    <AppShell crumb="Patients">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 lg:py-10">
        <header className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="text-[10.5px] tracking-[0.24em] uppercase" style={{ color: palette.muted }}>Clients</div>
            <h1 className="text-[clamp(1.9rem,3vw,2.6rem)] leading-[1.02] tracking-tight mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Patients
            </h1>
            <p className="text-[13px] mt-2 max-w-md" style={{ color: palette.muted }}>Your caseload — everyone you're currently seeing, on your waitlist, or maintaining continuity of care with.</p>
          </div>
          <Link to="/patients/new">
            <Button variant="primary"><Plus className="w-4 h-4" /> Add patient</Button>
          </Link>
        </header>

        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Active caseload" value={stats.active} icon={<Users className="w-3.5 h-3.5" />} />
          <StatCard label="On waitlist" value={stats.waitlist} icon={<UserPlus className="w-3.5 h-3.5" />} />
          <StatCard label="Elevated / crisis" value={stats.elevatedRisk} icon={<ShieldAlert className="w-3.5 h-3.5" />} accent="var(--pc-risk-elevated)" />
          <StatCard label="New this month" value={stats.newThisMonth} icon={<Sparkles className="w-3.5 h-3.5" />} />
        </div>

        {/* Filter bar */}
        <Card className="p-4 mb-5">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, concern, tag…"
                className="pl-9"
                aria-label="Search patients"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <SectionLabel>Status</SectionLabel>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {(["all", "active", "waitlist", "paused", "discharged"] as const).map((s) => (
                    <Pill key={s} active={status === s} onClick={() => setStatus(s)}>
                      {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
                    </Pill>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <SectionLabel>Risk</SectionLabel>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {(["all", "stable", "monitor", "elevated", "crisis"] as const).map((r) => (
                    <Pill key={r} active={risk === r} onClick={() => setRisk(r)}>
                      {r === "all" ? "All" : r[0].toUpperCase() + r.slice(1)}
                    </Pill>
                  ))}
                </div>
              </div>
              <div className="md:w-52">
                <SectionLabel>Sort</SectionLabel>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="w-full h-9 px-3 rounded-full text-[12px] outline-none bg-white"
                  style={{ border: `1px solid ${palette.border}`, color: palette.ink }}
                >
                  <option value="updated">Recently updated</option>
                  <option value="name">Name A–Z</option>
                  <option value="next">Next session</option>
                  <option value="sessions">Most sessions</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* List */}
        {sorted.length === 0 ? (
          <EmptyState
            title="No patients match those filters"
            hint="Try clearing filters or search terms."
            action={<Button variant="outline" onClick={() => { setSearch(""); setStatus("all"); setRisk("all"); }}>Clear filters</Button>}
          />
        ) : (
          <div className="text-[11px] mb-3" style={{ color: palette.muted }}>
            Showing {sorted.length} {sorted.length === 1 ? "patient" : "patients"}
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {sorted.map((p) => (
            <Link
              key={p.id}
              to="/patients/$pid"
              params={{ pid: p.id }}
              className="group block rounded-2xl transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none pc-fade-in"
              style={{ background: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <div className="p-4 flex items-center gap-4 group-hover:bg-[color:var(--pc-surface2,#F6F1F2)] rounded-2xl transition-colors">
                <img src={avatarUrl(p.id)} alt="" className="w-11 h-11 rounded-full shrink-0" style={{ border: `1px solid ${palette.border}` }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-medium truncate" style={{ color: palette.ink }}>{p.fullName}</span>
                    {p.preferredName && <span className="text-[11px]" style={{ color: palette.muted }}>({p.preferredName})</span>}
                    <span className="text-[11px]" style={{ color: palette.muted }}>· {p.pronouns}</span>
                  </div>
                  <p className="text-[12px] mt-0.5 truncate" style={{ color: palette.muted }}>{p.primaryConcern}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-[2px] rounded-full" style={{ background: palette.surface2, color: palette.muted, border: `1px solid ${palette.border}` }}>{t}</span>
                    ))}
                    {p.tags.length > 3 && <span className="text-[10px]" style={{ color: palette.muted }}>+{p.tags.length - 3}</span>}
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end gap-1.5 text-right shrink-0">
                  <div className="flex gap-1.5">
                    <RiskBadge level={p.risk} size="sm" />
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="text-[10.5px]" style={{ color: palette.muted }}>
                    Last {fmtDate(p.lastSessionAt, { day: "numeric", month: "short" })} · Next {fmtDate(p.nextSessionAt, { day: "numeric", month: "short" })} · {p.totalSessions} sessions
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: palette.muted }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent?: string }) {
  return (
    <Card className="p-4 relative overflow-hidden">
      <div className="flex items-center gap-1.5 text-[10.5px] tracking-[0.18em] uppercase mb-2" style={{ color: palette.muted }}>
        {icon}{label}
      </div>
      <div className="text-[clamp(1.6rem,2.4vw,2rem)] leading-none tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: accent ?? palette.ink }}>
        {value}
      </div>
    </Card>
  );
}
