import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { Card, SectionTitle, InlineButton, RoleChip, EmptyState } from "@/components/practice/team/primitives";
import { useInvites, useMe, sendInvite, revokeInvite, ROLE_META, ROLE_PERMS, type RoleKey } from "@/lib/team-store";
import { Mail, Send, Trash2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/team/invite")({
  head: () => ({ meta: [{ title: "Invite a member — Team" }] }),
  component: InvitePage,
});

const ROLES: RoleKey[] = ["clinician", "supervisor", "associate", "frontdesk", "billing", "readonly"];

function InvitePage() {
  const me = useMe();
  const invites = useInvites();
  const canInvite = me.role === "owner";
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleKey>("clinician");
  const [msg, setMsg] = useState("Welcome to the practice — glad to have you.");
  const [sent, setSent] = useState<string | null>(null);

  const submit = () => {
    if (!canInvite || !email.includes("@")) return;
    const inv = sendInvite(email.trim(), role, msg, me);
    setSent(inv.email);
    setEmail("");
    setTimeout(() => setSent(null), 3000);
  };

  const permCount = ROLE_PERMS[role].size;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 space-y-4">
        <Card className="p-5">
          <SectionTitle
            eyebrow="Invitation"
            title="Bring someone into the practice"
            hint="They'll receive a link to set up their account, upload credentials, and countersign your practice policies."
          />
          {!canInvite && (
            <div className="rounded-xl p-3 mb-3 text-[11.5px]" style={{ background: "#FFF7FA", border: `1px solid ${palette.soft}`, color: palette.muted }}>
              Only Owners can send invitations.
            </div>
          )}
          <div className="space-y-3">
            <Field label="Email">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@practice.in"
                className="w-full h-10 px-3 rounded-lg text-[13.5px] outline-none"
                style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}
                disabled={!canInvite}
              />
            </Field>
            <Field label="Role">
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    disabled={!canInvite}
                    onClick={() => setRole(r)}
                    className="h-8 px-3 rounded-full text-[11.5px] disabled:opacity-40"
                    style={{
                      background: role === r ? palette.ink : "transparent",
                      color: role === r ? "#fff" : palette.muted,
                      border: `1px solid ${role === r ? palette.ink : palette.border}`,
                    }}
                  >
                    {ROLE_META[r].label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Personal message">
              <textarea
                value={msg} onChange={(e) => setMsg(e.target.value)} rows={3}
                disabled={!canInvite}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-y"
                style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}
              />
            </Field>
            <div className="flex items-center justify-between">
              {sent && <div className="text-[12px] inline-flex items-center gap-1.5" style={{ color: "#1F7A3E" }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Invitation sent to {sent}
              </div>}
              <div className="ml-auto">
                <InlineButton tone="rose" onClick={submit} disabled={!canInvite || !email.includes("@")}>
                  <Send className="w-3 h-3" /> Send invitation
                </InlineButton>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle eyebrow="Sent" title="Pending invitations" />
          {invites.length === 0 && <EmptyState icon={Mail} title="No invitations yet" />}
          <ul className="divide-y" style={{ borderColor: palette.border }}>
            {invites.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: palette.soft, color: palette.primary }}>
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] truncate" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{inv.email}</div>
                  <div className="text-[10.5px] mt-0.5 flex items-center gap-2" style={{ color: palette.muted }}>
                    <RoleChip role={inv.role} />
                    <span>sent {new Date(inv.sentAt).toLocaleDateString([], { day: "numeric", month: "short" })}</span>
                    <span className="uppercase tracking-[0.18em]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{inv.status}</span>
                  </div>
                </div>
                {canInvite && (
                  <button
                    onClick={() => revokeInvite(inv.id, me)}
                    className="text-[11px] inline-flex items-center gap-1 h-7 px-2.5 rounded-full"
                    style={{ color: palette.muted, border: `1px solid ${palette.border}` }}
                    aria-label={`Revoke invite for ${inv.email}`}
                  >
                    <Trash2 className="w-3 h-3" /> Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="lg:col-span-2 p-4">
        <SectionTitle eyebrow="Preview" title="What they'll get" />
        <div className="rounded-2xl p-4" style={{ background: "linear-gradient(180deg, #FFF7FA, #ffffff)", border: `1px solid ${palette.border}` }}>
          <div className="uppercase text-[9.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>PeaceCode Practice</div>
          <h4 className="text-[16px] mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            {me.fullName} has invited you to join.
          </h4>
          <p className="mt-2 text-[12px]" style={{ color: palette.ink }}>{msg}</p>
          <div className="mt-3 rounded-xl p-3" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
            <div className="flex items-center gap-2">
              <RoleChip role={role} />
              <span className="text-[11.5px]" style={{ color: palette.muted }}>{permCount} permissions</span>
            </div>
            <p className="mt-1 text-[11.5px]" style={{ color: palette.muted }}>{ROLE_META[role].blurb}</p>
          </div>
          <div className="mt-4">
            <div className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] text-white" style={{ background: palette.primary }}>
              Accept invitation →
            </div>
          </div>
          <ul className="mt-4 text-[11.5px] space-y-1" style={{ color: palette.muted }}>
            <li>1. Confirm your name, credentials, and preferred pronoun</li>
            <li>2. Upload your license and any specialty certifications</li>
            <li>3. E-sign the practice's clinical and data policies</li>
            <li>4. Meet your supervisor if you're an associate</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
