import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Toggle } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";

export const Route = createFileRoute("/settings/integrations")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => {
    const [s, set] = usePractice();
    return (
      <>
        <PageHeader title="Integrations" description="Connect your scheduling and video tools." />
        <Section title="Calendar & video">
          <Row label="Google Calendar" hint="Two-way sync for your availability" action={<Toggle checked={s.integrations.googleCalendar} onChange={(v) => set((p) => ({ ...p, integrations: { ...p.integrations, googleCalendar: v } }))} />} />
          <Row label="Zoom" hint="Auto-create meeting links for video sessions" action={<Toggle checked={s.integrations.zoom} onChange={(v) => set((p) => ({ ...p, integrations: { ...p.integrations, zoom: v } }))} />} />
          <Row label="Google Meet" action={<Toggle checked={s.integrations.googleMeet} onChange={(v) => set((p) => ({ ...p, integrations: { ...p.integrations, googleMeet: v } }))} />} />
        </Section>
        <Section title="Patient communication">
          <Row label="WhatsApp Business" hint="Session reminders & receipts" action={<Toggle checked={s.integrations.whatsapp} onChange={(v) => set((p) => ({ ...p, integrations: { ...p.integrations, whatsapp: v } }))} />} />
        </Section>
      </>
    );
  },
});
