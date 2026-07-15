import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Toggle } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";

export const Route = createFileRoute("/settings/notifications")({
  component: () => {
    const [s, set] = usePractice();
    return (
      <>
        <PageHeader title="Notifications" description="How PeaceCode reaches you across email, SMS, and push." />
        <Section title="Email">
          <Row label="New booking" action={<Toggle checked={s.notifications.email.newBooking} onChange={(v) => set((p) => ({ ...p, notifications: { ...p.notifications, email: { ...p.notifications.email, newBooking: v } } }))} />} />
          <Row label="Cancellation" action={<Toggle checked={s.notifications.email.cancellation} onChange={(v) => set((p) => ({ ...p, notifications: { ...p.notifications, email: { ...p.notifications.email, cancellation: v } } }))} />} />
          <Row label="Patient message" action={<Toggle checked={s.notifications.email.message} onChange={(v) => set((p) => ({ ...p, notifications: { ...p.notifications, email: { ...p.notifications.email, message: v } } }))} />} />
          <Row label="Daily summary" hint="Every morning at 7am" action={<Toggle checked={s.notifications.email.dailySummary} onChange={(v) => set((p) => ({ ...p, notifications: { ...p.notifications, email: { ...p.notifications.email, dailySummary: v } } }))} />} />
        </Section>
        <Section title="SMS">
          <Row label="New booking" action={<Toggle checked={s.notifications.sms.newBooking} onChange={(v) => set((p) => ({ ...p, notifications: { ...p.notifications, sms: { ...p.notifications.sms, newBooking: v } } }))} />} />
          <Row label="Cancellation" action={<Toggle checked={s.notifications.sms.cancellation} onChange={(v) => set((p) => ({ ...p, notifications: { ...p.notifications, sms: { ...p.notifications.sms, cancellation: v } } }))} />} />
        </Section>
        <Section title="Push">
          <Row label="New booking" action={<Toggle checked={s.notifications.push.newBooking} onChange={(v) => set((p) => ({ ...p, notifications: { ...p.notifications, push: { ...p.notifications.push, newBooking: v } } }))} />} />
          <Row label="Patient message" action={<Toggle checked={s.notifications.push.message} onChange={(v) => set((p) => ({ ...p, notifications: { ...p.notifications, push: { ...p.notifications.push, message: v } } }))} />} />
          <Row label="Clinical alerts (risk flags)" action={<Toggle checked={s.notifications.push.alerts} onChange={(v) => set((p) => ({ ...p, notifications: { ...p.notifications, push: { ...p.notifications.push, alerts: v } } }))} />} />
        </Section>
      </>
    );
  },
});
