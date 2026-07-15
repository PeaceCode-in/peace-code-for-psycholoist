import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, DangerButton } from "@/components/settings/primitives";
import { endSession } from "@/lib/auth-store";

export const Route = createFileRoute("/settings/danger")({
  component: () => {
    const nav = useNavigate();
    return (
      <>
        <PageHeader title="Danger zone" description="Irreversible actions. Please read carefully." />
        <Section title="Deactivate">
          <Row label="Deactivate practice" hint="Hide your profile and stop accepting new patients. You keep access to records."
               action={<DangerButton>Deactivate</DangerButton>} />
        </Section>
        <Section title="Delete">
          <Row label="Delete account" hint="Permanently remove your practice. Patient records are exported to you first."
               action={<DangerButton onClick={() => { if (confirm("This will sign you out on this device. Continue?")) { endSession(); nav({ to: "/auth" }); } }}>Delete account</DangerButton>} />
        </Section>
      </>
    );
  },
});
