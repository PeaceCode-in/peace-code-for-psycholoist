import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { Card, SectionTitle, Avatar, RoleChip, StatusPill, CapacityMeter, Metric, InlineButton, EmptyState } from "@/components/practice/team/primitives";
import {
  useMembers, useMe, useHandoffs, useReferrals, useSupervisions, useAudit,
  fmtRelDay, effectivePermissions, PERM_META, ROLE_META, type PermKey,
} from "@/lib/team-store";
import { ArrowLeft, Mail, Phone, ArrowRightLeft, Share2, GraduationCap, ScrollText, Languages, Sparkles } from "lucide-react";

export const Route = createFileRoute("/team/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Member · ${params.id} — Team` },
    ],
  }),
  component: MemberPage,
});

function MemberPage() {
  const { id } = Route.useParams();
  const members = useMembers();
  const me = useMe();
  const handoffs = useHandoffs();
  const referrals = useReferrals();
  const supervisions = useSupervisions();
  const audit = useAudit();
  const m = members.find((x) => x.id === id);
  if (!m) throw notFound();

  const canSeeRevenue = me.role === "owner";
  const perms = [...effectivePermissions(m)];
  const permsByGroup = perms.reduce<Record<string, PermKey[]>>((acc, p) => {
    const g = PERM_META[p].group;
    (acc[g] ??= []).push(p);
    return acc;
  }, {});

  const memberHandoffs = handoffs.filter((h) => h.fromId === id || h.toId === id).slice(0, 5);
  const memberReferrals = referrals.filter((r) => r.fromId === id || r.toId === id).slice(0, 5);
  const supervisorOf = supervisions.filter((s) => s.supervisorId === id);
  const superviseeOf = supervisions.filter((s) => s.superviseeId === id);
  const memberAudit = audit.filter((a) => a.actorId === id || a.target === id).slice(0, 8);

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/team"
          className="inline-flex items-center gap-1 text-[11.5px] mb-3"
          style={{ color: palette.muted }}
        >
          <ArrowLeft className="w-3 h-3" /> Back to roster
        </Link>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <Avatar member={m} size={64} />
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[22px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{m.fullName}</h2>
              <RoleChip role={m.role} />
              <StatusPill status={m.status} />
            </div>
            <div className="text-[11.5px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              {m.credentials}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px]" style={{ color: palette.muted }}>
              <span className="inline-flex items-center gap-1.5"><Mail className="w-3 h-3" /> {m.email}</span>
              {m.phone && <span className="inline-flex items-center gap-1.5"><Phone className="w-3 h-3" /> {m.phone}</span>}
              <span className="inline-flex items-center gap-1.5"><Languages className="w-3 h-3" /> {m.languages.join(" · ")}</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> {m.specialties.join(" · ")}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/team/handoffs"><InlineButton tone="ghost"><ArrowRightLeft className="w-3 h-3" /> Share case</InlineButton></Link>
            <Link to="/team/referrals"><InlineButton tone="ink"><Share2 className="w-3 h-3" /> Refer patient</InlineButton></Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
          <Metric label="Caseload" value={m.activeCaseload} unit="patients" />
          <div>
            <div className="uppercase text-[9.5px] tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Utilization</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontVariantNumeric: "tabular-nums" }}>{Math.round(m.utilization * 100)}%</span>
            </div>
            <div className="mt-1.5"><CapacityMeter pct={m.utilization} /></div>
          </div>
          <Metric label="No-show" value={`${Math.round(m.noShowRate * 100)}%`} unit="last 30d" tone={m.noShowRate > 0.12 ? "#B08444" : undefined} />
          <Metric label="Outcome index" value={m.outcomeIndex || "—"} unit={m.outcomeIndex ? "0–100" : ""} />
          <Metric label="Next open" value={fmtRelDay(m.nextAvailable)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <SectionTitle eyebrow="Access" title="What this member can see" hint="Effective permissions — the union of role defaults and per-member overrides." />
          <div className="space-y-3">
            {Object.entries(permsByGroup).map(([g, list]) => (
              <div key={g}>
                <div className="uppercase text-[9.5px] tracking-[0.22em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{g}</div>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((p) => (
                    <span
                      key={p}
                      className="text-[10.5px] px-2 h-[22px] rounded-full inline-flex items-center"
                      style={{ background: palette.soft, color: palette.primary }}
                    >
                      {PERM_META[p].label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {perms.length === 0 && (
              <div className="text-[11.5px]" style={{ color: palette.muted }}>This role has no active permissions.</div>
            )}
          </div>
          <div className="mt-4 text-[11.5px]" style={{ color: palette.muted }}>
            {ROLE_META[m.role].blurb}
          </div>
          <div className="mt-3">
            <Link to="/team/roles"><InlineButton tone="ghost">Edit role & permissions</InlineButton></Link>
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle eyebrow="Supervision" title={supervisorOf.length ? "Supervises" : superviseeOf.length ? "Supervised by" : "No supervision link"} />
          {supervisorOf.length > 0 && (
            <ul className="space-y-2">
              {supervisorOf.map((s) => {
                const sup = members.find((x) => x.id === s.superviseeId);
                if (!sup) return null;
                return (
                  <li key={s.id} className="flex items-center gap-3">
                    <Avatar member={sup} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px]" style={{ color: palette.ink }}>{sup.fullName}</div>
                      <div className="text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                        {s.frequency} · {s.hoursLoggedMonth.toFixed(1)}h / {s.hoursRequiredMonth}h this month
                      </div>
                    </div>
                    <div className="text-[11px]" style={{ color: palette.muted }}>next {fmtRelDay(s.nextSessionAt)}</div>
                  </li>
                );
              })}
            </ul>
          )}
          {superviseeOf.length > 0 && !supervisorOf.length && (
            <ul className="space-y-2">
              {superviseeOf.map((s) => {
                const sup = members.find((x) => x.id === s.supervisorId);
                if (!sup) return null;
                return (
                  <li key={s.id} className="flex items-center gap-3">
                    <Avatar member={sup} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px]" style={{ color: palette.ink }}>{sup.fullName}</div>
                      <div className="text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                        {s.frequency} · {s.hoursLoggedMonth.toFixed(1)}h logged
                      </div>
                    </div>
                    <div className="text-[11px]" style={{ color: palette.muted }}>next {fmtRelDay(s.nextSessionAt)}</div>
                  </li>
                );
              })}
            </ul>
          )}
          {!supervisorOf.length && !superviseeOf.length && (
            <EmptyState icon={GraduationCap} title="No supervision relationship" hint="This member is not in a supervision loop." />
          )}
        </Card>

        <Card className="p-4">
          <SectionTitle eyebrow="Cases" title="Recent handoffs & referrals" />
          <ul className="space-y-2">
            {memberHandoffs.map((h) => {
              const other = h.fromId === m.id ? members.find((x) => x.id === h.toId) : members.find((x) => x.id === h.fromId);
              return (
                <li key={h.id} className="flex items-center gap-3 text-[12px]">
                  <ArrowRightLeft className="w-3.5 h-3.5" style={{ color: palette.muted }} />
                  <span className="flex-1 truncate" style={{ color: palette.ink }}>
                    {h.patientName} <span style={{ color: palette.muted }}>· {h.fromId === m.id ? "to" : "from"} {other?.fullName ?? "—"}</span>
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{h.status}</span>
                </li>
              );
            })}
            {memberReferrals.map((r) => {
              const other = r.fromId === m.id ? members.find((x) => x.id === r.toId) : members.find((x) => x.id === r.fromId);
              return (
                <li key={r.id} className="flex items-center gap-3 text-[12px]">
                  <Share2 className="w-3.5 h-3.5" style={{ color: palette.muted }} />
                  <span className="flex-1 truncate" style={{ color: palette.ink }}>
                    {r.patientName} <span style={{ color: palette.muted }}>· {r.fromId === m.id ? "to" : "from"} {other?.fullName ?? "—"}</span>
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{r.status}</span>
                </li>
              );
            })}
            {!memberHandoffs.length && !memberReferrals.length && (
              <EmptyState icon={Share2} title="No shared cases" hint="Nothing in or out for this member yet." />
            )}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionTitle eyebrow="Trail" title="Recent activity" hint="Actions this member took or that touched their record." />
          <ul className="space-y-1.5">
            {memberAudit.map((a) => (
              <li key={a.id} className="flex items-baseline gap-3 text-[11.5px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <span style={{ color: palette.muted }}>{new Date(a.at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                <span style={{ color: palette.primary }}>{a.action}</span>
                <span className="truncate" style={{ color: palette.ink }}>{a.targetLabel ?? a.target ?? ""}</span>
              </li>
            ))}
            {!memberAudit.length && (
              <EmptyState icon={ScrollText} title="Nothing here yet" />
            )}
          </ul>
        </Card>
      </div>

      {canSeeRevenue && m.revenueMonth > 0 && (
        <Card className="p-4">
          <SectionTitle eyebrow="Owner view" title="Revenue this month" hint="Only owners see revenue figures for individual clinicians." />
          <div className="text-[32px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontVariantNumeric: "tabular-nums" }}>
            ₹{m.revenueMonth.toLocaleString("en-IN")}
          </div>
        </Card>
      )}
    </div>
  );
}
