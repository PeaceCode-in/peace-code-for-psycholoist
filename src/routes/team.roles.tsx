import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { palette } from "@/components/practice/palette";
import { Card, SectionTitle, Avatar, RoleChip, InlineButton } from "@/components/practice/team/primitives";
import {
  useMembers, useMe, ROLE_META, ROLE_PERMS, PERM_META,
  effectivePermissions, updateMemberRole, togglePerm,
  type PermKey, type RoleKey, type TeamMember,
} from "@/lib/team-store";
import { ShieldCheck, Check, X, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/team/roles")({
  head: () => ({
    meta: [
      { title: "Roles & permissions — Team" },
      { name: "description", content: "Practice roles, what each can see, and per-member overrides." },
    ],
  }),
  component: RolesPage,
});

const ROLE_KEYS: RoleKey[] = ["owner", "supervisor", "clinician", "associate", "frontdesk", "billing", "readonly"];

function RolesPage() {
  const members = useMembers();
  const me = useMe();
  const canManage = me.role === "owner";
  const [selectedId, setSelectedId] = useState<string>(members.find((m) => m.id !== "me")?.id ?? members[0].id);
  const selected = members.find((m) => m.id === selectedId) ?? members[0];
  const [pendingRole, setPendingRole] = useState<RoleKey | null>(null);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <SectionTitle
          eyebrow="Role model"
          title="Seven roles, one clear contract"
          hint="Read-only means read-only. Billing-only means billing-only. No accidental clinical access."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          {ROLE_KEYS.map((r) => (
            <div key={r} className="rounded-xl p-3" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
              <div className="flex items-center justify-between">
                <RoleChip role={r} />
                <span className="text-[10.5px] tabular-nums" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  {ROLE_PERMS[r].size} perms
                </span>
              </div>
              <p className="text-[11.5px] mt-2 leading-relaxed" style={{ color: palette.muted }}>{ROLE_META[r].blurb}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 p-3">
          <SectionTitle eyebrow="Members" title="Pick who to edit" />
          <ul className="space-y-0.5">
            {members.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => { setSelectedId(m.id); setPendingRole(null); }}
                  className="w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors"
                  style={{
                    background: m.id === selectedId ? palette.soft : "transparent",
                    color: palette.ink,
                  }}
                >
                  <Avatar member={m} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] truncate" style={{ fontFamily: "'Fraunces', serif" }}>{m.fullName}</div>
                    <div className="text-[10px] truncate" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {ROLE_META[m.role].label}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="lg:col-span-8 space-y-4">
          <MemberRoleEditor
            member={selected}
            pendingRole={pendingRole}
            setPendingRole={setPendingRole}
            canManage={canManage && !(selected.role === "owner" && me.id === selected.id)}
            onConfirm={() => {
              if (pendingRole) updateMemberRole(selected.id, pendingRole, me);
              setPendingRole(null);
            }}
          />
          <PermissionsEditor member={selected} me={me} canManage={canManage} />
        </div>
      </div>
    </div>
  );
}

function MemberRoleEditor({ member, pendingRole, setPendingRole, canManage, onConfirm }: {
  member: TeamMember;
  pendingRole: RoleKey | null;
  setPendingRole: (r: RoleKey | null) => void;
  canManage: boolean;
  onConfirm: () => void;
}) {
  const currentPerms = ROLE_PERMS[member.role];
  const nextPerms = pendingRole ? ROLE_PERMS[pendingRole] : currentPerms;
  const added = pendingRole ? [...nextPerms].filter((p) => !currentPerms.has(p)) : [];
  const removed = pendingRole ? [...currentPerms].filter((p) => !nextPerms.has(p)) : [];

  return (
    <Card className="p-4">
      <SectionTitle
        eyebrow="Role"
        title={member.fullName}
        hint={canManage ? "Changing a role rewrites permissions to the new role's defaults." : "Only Owners can change roles."}
      />
      <div className="flex flex-wrap gap-1.5">
        {ROLE_KEYS.map((r) => {
          const active = (pendingRole ?? member.role) === r;
          return (
            <button
              key={r}
              disabled={!canManage}
              onClick={() => setPendingRole(r === member.role ? null : r)}
              className="h-8 px-3 rounded-full text-[11.5px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: active ? palette.ink : "transparent",
                color: active ? "#fff" : palette.muted,
                border: `1px solid ${active ? palette.ink : palette.border}`,
              }}
            >
              {ROLE_META[r].label}
            </button>
          );
        })}
      </div>

      {pendingRole && pendingRole !== member.role && (
        <div className="mt-4 rounded-xl p-3" style={{ background: "#FFF7FA", border: `1px solid ${palette.soft}` }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: palette.primary }} />
            <span className="text-[12px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>
              Confirm role change · {ROLE_META[member.role].label} → {ROLE_META[pendingRole].label}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px]">
            <div>
              <div className="uppercase text-[9.5px] tracking-[0.22em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                Will gain
              </div>
              <ul className="space-y-1">
                {added.length === 0 && <li style={{ color: palette.muted }}>Nothing new.</li>}
                {added.map((p) => (
                  <li key={p} className="flex items-center gap-1.5" style={{ color: "#1F7A3E" }}>
                    <Check className="w-3 h-3" /> {PERM_META[p].label}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="uppercase text-[9.5px] tracking-[0.22em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                Will lose
              </div>
              <ul className="space-y-1">
                {removed.length === 0 && <li style={{ color: palette.muted }}>Nothing removed.</li>}
                {removed.map((p) => (
                  <li key={p} className="flex items-center gap-1.5" style={{ color: "#8B4A6A" }}>
                    <X className="w-3 h-3" /> {PERM_META[p].label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <InlineButton tone="ghost" onClick={() => setPendingRole(null)}>Cancel</InlineButton>
            <InlineButton tone="rose" onClick={onConfirm}>Confirm change</InlineButton>
          </div>
        </div>
      )}
    </Card>
  );
}

function PermissionsEditor({ member, me, canManage }: { member: TeamMember; me: TeamMember; canManage: boolean }) {
  const effective = effectivePermissions(member);
  const groups = useMemo(() => {
    const g: Record<string, PermKey[]> = {};
    (Object.keys(PERM_META) as PermKey[]).forEach((p) => {
      (g[PERM_META[p].group] ??= []).push(p);
    });
    return g;
  }, []);

  return (
    <Card className="p-4">
      <SectionTitle
        eyebrow="Per-member overrides"
        title="Fine-grained permissions"
        hint="Add or subtract single capabilities beyond this member's role. Every change is logged."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {Object.entries(groups).map(([g, list]) => (
          <div key={g}>
            <div className="uppercase text-[9.5px] tracking-[0.22em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{g}</div>
            <ul className="space-y-1">
              {list.map((p) => {
                const on = effective.has(p);
                const roleDefault = ROLE_PERMS[member.role].has(p);
                return (
                  <li key={p} className="flex items-center justify-between gap-2 text-[12px]">
                    <span style={{ color: on ? palette.ink : palette.muted }}>{PERM_META[p].label}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[9.5px] uppercase tracking-[0.18em]"
                        style={{ color: on !== roleDefault ? palette.primary : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}
                      >
                        {on !== roleDefault ? "Override" : "Default"}
                      </span>
                      <button
                        onClick={() => canManage && togglePerm(member.id, p, me)}
                        disabled={!canManage}
                        className="relative w-9 h-5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: on ? palette.primary : palette.border }}
                        aria-label={`${on ? "Revoke" : "Grant"} ${PERM_META[p].label}`}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                          style={{ background: palette.solid, transform: `translateX(${on ? 16 : 2}px)`, boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
                        />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {!canManage && (
        <div className="mt-3 text-[11px] inline-flex items-center gap-1.5" style={{ color: palette.muted }}>
          <ShieldCheck className="w-3 h-3" /> Only Owners can change permissions.
        </div>
      )}
    </Card>
  );
}
