import { createFileRoute } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { Card, SectionTitle, Avatar, EmptyState } from "@/components/practice/team/primitives";
import { useLeaves, useMembers, fmtRelDay } from "@/lib/team-store";
import { CalendarClock, Umbrella, Plane, Stethoscope, User } from "lucide-react";

export const Route = createFileRoute("/team/coverage")({
  head: () => ({ meta: [{ title: "Coverage & OOO — Team" }] }),
  component: CoveragePage,
});

const DAYS_AHEAD = 21;
const day = 86_400_000;

const KIND_ICON = {
  vacation:   Plane,
  sick:       Stethoscope,
  conference: User,
  personal:   Umbrella,
} as const;

function CoveragePage() {
  const leaves = useLeaves();
  const members = useMembers();
  const start = Date.now() - day;
  const end = start + DAYS_AHEAD * day;

  const upcoming = leaves
    .filter((l) => l.to > start && l.from < end)
    .sort((a, b) => a.from - b.from);

  return (
    <div className="space-y-5">
      <div>
        <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Next three weeks</div>
        <h2 className="text-[20px] mt-1 tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          Who's away, and who's covering
        </h2>
        <p className="text-[12.5px] mt-1 max-w-lg" style={{ color: palette.muted }}>
          A quiet coverage map. Hover a bar to see the person, the window, and who's picking up their sessions.
        </p>
      </div>

      <Card className="p-4">
        <SectionTitle eyebrow="Timeline" title="Leave overlay" />
        <div className="mt-2">
          <div className="grid" style={{ gridTemplateColumns: "180px 1fr" }}>
            <div />
            <div className="relative h-6 mb-2">
              {Array.from({ length: 4 }).map((_, i) => {
                const d = new Date(start + i * 7 * day);
                return (
                  <div key={i} className="absolute top-0" style={{ left: `${(i * 7 / DAYS_AHEAD) * 100}%` }}>
                    <span className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {d.toLocaleDateString([], { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {members.map((m) => {
            const rows = upcoming.filter((l) => l.memberId === m.id);
            return (
              <div key={m.id} className="grid items-center py-2" style={{ gridTemplateColumns: "180px 1fr" }}>
                <div className="flex items-center gap-2 pr-3">
                  <Avatar member={m} size={26} />
                  <div className="min-w-0">
                    <div className="text-[12px] truncate" style={{ color: palette.ink }}>{m.preferredName ?? m.fullName}</div>
                  </div>
                </div>
                <div className="relative h-6 rounded-lg" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
                  {rows.map((l) => {
                    const leftPct = Math.max(0, ((l.from - start) / (end - start)) * 100);
                    const widthPct = Math.min(100 - leftPct, ((l.to - Math.max(l.from, start)) / (end - start)) * 100);
                    const covering = members.find((x) => x.id === l.coveringId);
                    return (
                      <div
                        key={l.id}
                        title={`${l.kind}${covering ? ` · covered by ${covering.preferredName ?? covering.fullName}` : ""}`}
                        className="absolute inset-y-0 rounded-md flex items-center px-2"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          background: `linear-gradient(90deg, ${palette.soft} 0%, ${palette.primary}22 100%)`,
                          border: `1px solid ${palette.primary}55`,
                        }}
                      >
                        <span className="text-[10px] truncate" style={{ color: palette.primary, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                          {l.kind}
                        </span>
                      </div>
                    );
                  })}
                  {/* today line */}
                  <div className="absolute top-0 bottom-0 w-px" style={{ left: `${((Date.now() - start) / (end - start)) * 100}%`, background: palette.primary }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle eyebrow="Details" title="Leaves in the next three weeks" hint="Suggested cover is auto-matched by specialty and language." />
        {upcoming.length === 0 && <EmptyState icon={CalendarClock} title="No leave scheduled" />}
        <ul className="space-y-2">
          {upcoming.map((l) => {
            const who = members.find((m) => m.id === l.memberId);
            const cov = members.find((m) => m.id === l.coveringId);
            if (!who) return null;
            const Icon = KIND_ICON[l.kind];
            return (
              <li key={l.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: palette.soft, color: palette.primary }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>
                    {who.fullName} · <span style={{ color: palette.muted, textTransform: "capitalize" }}>{l.kind}</span>
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    {fmtRelDay(l.from)} → {fmtRelDay(l.to)}{l.note ? ` · ${l.note}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Cover</div>
                  <div className="text-[12px]" style={{ color: cov ? palette.ink : palette.muted }}>{cov ? cov.preferredName ?? cov.fullName : "Unassigned"}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
