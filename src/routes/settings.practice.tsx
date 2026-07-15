import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, Toggle } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";

export const Route = createFileRoute("/settings/practice")({
  component: () => {
    const [s, set] = usePractice();
    return (
      <>
        <PageHeader title="Clinic" description="Where and how you see patients." />
        <Section title="Clinic details">
          <Row label="Clinic name"><div className="mt-2 max-w-md"><TextField value={s.clinic.name} onChange={(v) => set((p) => ({ ...p, clinic: { ...p.clinic, name: v } }))} /></div></Row>
          <Row label="Address"><div className="mt-2"><TextField value={s.clinic.address} onChange={(v) => set((p) => ({ ...p, clinic: { ...p.clinic, address: v } }))} /></div></Row>
          <Row label="City"><div className="mt-2 max-w-xs"><TextField value={s.clinic.city} onChange={(v) => set((p) => ({ ...p, clinic: { ...p.clinic, city: v } }))} /></div></Row>
          <Row label="Timezone"><div className="mt-2 max-w-xs"><TextField value={s.clinic.timezone} onChange={(v) => set((p) => ({ ...p, clinic: { ...p.clinic, timezone: v } }))} /></div></Row>
        </Section>
        <Section title="Modalities">
          <Row label="Video sessions" action={<Toggle checked={s.clinic.modalities.video} onChange={(v) => set((p) => ({ ...p, clinic: { ...p.clinic, modalities: { ...p.clinic.modalities, video: v } } }))} />} />
          <Row label="In-person sessions" action={<Toggle checked={s.clinic.modalities.inPerson} onChange={(v) => set((p) => ({ ...p, clinic: { ...p.clinic, modalities: { ...p.clinic.modalities, inPerson: v } } }))} />} />
          <Row label="Phone sessions" action={<Toggle checked={s.clinic.modalities.phone} onChange={(v) => set((p) => ({ ...p, clinic: { ...p.clinic, modalities: { ...p.clinic.modalities, phone: v } } }))} />} />
        </Section>
      </>
    );
  },
});
