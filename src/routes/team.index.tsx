import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { palette } from "@/components/practice/palette";
import { Card, Avatar, StatusPill, RoleChip, CapacityMeter, InlineButton } from "@/components/practice/team/primitives";
import { useMembers, useMe, fmtRelDay, type TeamMember, ROLE_META } from "@/lib/team-store";
import { Search, Plus, UsersRound } from "lucide-react";

export const Route = createFileRoute("/team/")({
  head: () => ({
    meta: [
      { title: "Roster — Team" },
      { name: "description", content: "Every clinician on your practice, at a glance." },
    ],
  }),
  component: RosterPage,
});

const filters = ["All", "Clinicians", "Supervisors", "Associates", "Support", "On leave"] as const;
type F = typeof filters[number];

function match(m: TeamMember, f: F, q: string): boolean {
  if (q) {
    const s = `${m.fullName} ${m.credentials} ${m.specialties.join(" ")} ${ROLE_META[m.role].label}`.toLowerCase();
    if (!s.includes(q.toLowerCase())) return false;
  }
  if (f === "All") return true;
  if (f === "Clinicians") return m.role === "clinician";
  if (f === "Supervisors") return m.role === "supervisor" || m.role === "owner";
  if (f === "Associates") return m.role === "associate";
  if (f === "Support") return m.role === "frontdesk" || m.role === "billing" || m.role === "readonly";
  if (f === "On leave") return m.status === "on-leave";
  return true;
}

function RosterPage() {
  const members = useMembers();
  const me = useMe();
  const canSeeRevenue = me.role === "owner";
  const [f, setF] = useState<F>("All");
  const [q, setQ] = useState("");
  const list = useMemo(() => members.filter((m) => match(m, f, q)), [members, f, q]);

  const totalCaseload = members.reduce((a, m) => a + m.activeCaseload, 0);
  const activeMembers = members.filter((m) => m.status === "active").length;
  const avgUtil = members.filter((m) => m.weeklyCapacity > 0).reduce((a, m, _, arr) => a + m.utilization / arr.length, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="On the roster" value={members.length} sub={`${activeMembers} active`} />
        <StatCard label="Total caseload" value={totalCaseload} sub="patients being seen" />
        <StatCard label="Avg utilization" value={`${Math.round(avgUtil * 100)}%`} sub="of weekly capacity" />
        <StatCard label="Coverage risk" value={members.filter((m) => m.status === "on-leave").length} sub="on leave this week" tone="#B08444" />
      </div>

      <Card>
        <div className="p-3 sm:p-4 flex flex-wrap items-center gap-2 border-b" style={{ borderColor: palette.border }}>
          <div
            className="flex items-center gap-1.5 h-9 pl-3 pr-2 rounded-full flex-1 min-w-[220px] max-w-md"
            style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}
          >
            <Search className="w-3.5 h-3.5" style={{ color: palette.muted }} />
            <input
              className="flex-1 bg-transparent outline-none text-[12.5px] min-w-0"
              placeholder="Search by name, credential, specialty…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ color: palette.ink }}
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {filters.map((x) => (
              <button
                key={x}
                onClick={() => setF(x)}
                className="h-8 px-3 rounded-full text-[11.5px] transition-colors"
                style={{
                  background: f === x ? palette.ink : "transparent",
                  color: f === x ? "#fff" : palette.muted,
                  border: `1px solid ${f === x ? palette.ink : palette.border}`,
                }}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <Link to="/team/invite">
              <InlineButton tone="rose">
                <Plus className="w-3 h-3" /> Invite member
              </InlineButton>
            </Link>
          </div>
        </div>

        <ul className="divide-y" style={{ borderColor: palette.border }}>
          {list.map((m) => (
            <li key={m.id}>
              <Link
                to="/team/$id"
                params={{ id: m.id }}
                className="grid grid-cols-12 gap-3 items-center px-3 sm:px-5 py-4 transition-colors"
                style={{ color: palette.ink }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(241,199,214,0.14)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                  <Avatar member={m} size={40} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif" }}>{m.fullName}</span>
                      <RoleChip role={m.role} />
                      <StatusPill status={m.status} />
                    </div>
                    <div className="text-[10.5px] mt-0.5 truncate" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {m.credentials}
                    </div>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <div className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Caseload</div>
                  <div className="text-[15px] mt-0.5" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontVariantNumeric: "tabular-nums" }}>
                    {m.activeCaseload}
                    <span className="text-[10px] ml-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>patients</span>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-3">
                  <div className="text-[9.5px] uppercase tracking-[0.18em] flex items-center justify-between" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    <span>Utilization</span>
                    <span style={{ color: m.utilization > 0.9 ? "#B08444" : palette.muted }}>{Math.round(m.utilization * 100)}%</span>
                  </div>
                  <div className="mt-1"><CapacityMeter pct={m.utilization} tone={m.utilization > 0.9 ? "#B08444" : palette.primary} /></div>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <div className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Next open</div>
                  <div className="text-[12px] mt-1" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    {fmtRelDay(m.nextAvailable)}
                  </div>
                </div>

                <div className="col-span-6 md:col-span-1 text-right">
                  {canSeeRevenue && m.revenueMonth > 0 ? (
                    <>
                      <div className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Revenue</div>
                      <div className="text-[12px] mt-1" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                        ₹{Math.round(m.revenueMonth / 1000)}k
                      </div>
                    </>
                  ) : (
                    <span className="text-[10.5px]" style={{ color: palette.muted }}>—</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
          {list.length === 0 && (
            <li className="p-10 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: palette.soft, color: palette.primary }}>
                <UsersRound className="w-4 h-4" />
              </div>
              <div className="text-[13px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>No one matches that filter</div>
              <div className="text-[11px]" style={{ color: palette.muted }}>Try another category or clear the search.</div>
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function StatCard({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: string }) {
  return (
    <Card className="p-4">
      <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-1.5 text-[28px] leading-none" style={{ fontFamily: "'Fraunces', serif", color: tone ?? palette.ink, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div className="mt-1 text-[11px]" style={{ color: palette.muted }}>{sub}</div>}
    </Card>
  );
}
