import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, Toggle, DangerButton } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";
import { endSession } from "@/lib/auth-store";

export const Route = createFileRoute("/settings/security")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => {
    const [s, set] = usePractice();
    const nav = useNavigate();
    return (
      <>
        <PageHeader title="Security" description="Protect access to your patient records." />
        <Section title="Sign in">
          <Row label="Two-factor authentication" hint="Recommended — TOTP or SMS" action={<Toggle checked={s.security.twoFA} onChange={(v) => set((p) => ({ ...p, security: { ...p.security, twoFA: v } }))} />} />
          <Row label="Session timeout (minutes)" hint="Automatically sign out after inactivity"><div className="mt-2 max-w-[120px]"><TextField type="number" value={String(s.security.sessionTimeoutMin)} onChange={(v) => set((p) => ({ ...p, security: { ...p.security, sessionTimeoutMin: Number(v) || 0 } }))} /></div></Row>
        </Section>
        <Section title="Active session">
          <Row label="This device" hint="Signed in now"
               action={<DangerButton onClick={() => { endSession(); nav({ to: "/auth" }); }}>Sign out</DangerButton>} />
        </Section>
      </>
    );
  },
});
