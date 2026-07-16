import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Select, Toggle, TextArea, PrimaryButton } from "@/components/settings/primitives";
import { usePersisted } from "@/lib/practice-settings";

export const Route = createFileRoute("/settings/telehealth")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }, { title: "Telehealth — Settings" }] }),
  component: TelehealthPage,
});

type Provider = "builtin" | "zoom" | "meet";
interface Telehealth {
  provider: Provider;
  waitingRoom: string;
  recordingDefault: boolean;
  requireConsent: boolean;
  autoLockAfterMin: "0" | "5" | "10" | "15";
}

const DEFAULT: Telehealth = {
  provider: "builtin",
  waitingRoom: "Thanks for arriving on time. Your clinician will let you in shortly — take a few slow breaths in the meantime.",
  recordingDefault: false,
  requireConsent: true,
  autoLockAfterMin: "10",
};

function TelehealthPage() {
  const [t, setT] = usePersisted<Telehealth>("telehealth", DEFAULT);

  return (
    <>
      <PageHeader title="Telehealth" description="Video provider, waiting room copy, recording defaults." />

      <Section title="Video provider">
        <Row label="Provider" hint="Built-in works without any external account."
          action={<Select value={t.provider} onChange={(v) => { setT((p) => ({ ...p, provider: v })); toast.success(`Provider · ${v}`); }}
            options={[{ value: "builtin", label: "Built-in" }, { value: "zoom", label: "Zoom" }, { value: "meet", label: "Google Meet" }]} />} />
        <Row label="Auto-lock waiting room after" hint="Locks new arrivals from joining mid-session."
          action={<Select value={t.autoLockAfterMin} onChange={(v) => setT((p) => ({ ...p, autoLockAfterMin: v }))}
            options={[{ value: "0", label: "Never" }, { value: "5", label: "5 min" }, { value: "10", label: "10 min" }, { value: "15", label: "15 min" }]} />} />
      </Section>

      <Section title="Waiting room" hint="Shown to patients before you admit them.">
        <div className="p-4 space-y-3">
          <TextArea value={t.waitingRoom} onChange={(v) => setT((p) => ({ ...p, waitingRoom: v }))} rows={4} />
          <div className="flex justify-end"><PrimaryButton onClick={() => toast.success("Waiting room saved")}>Save</PrimaryButton></div>
        </div>
      </Section>

      <Section title="Recording">
        <Row label="Recording default" hint="Off — recording still needs per-session consent when enabled."
          action={<Toggle checked={t.recordingDefault} onChange={(v) => { setT((p) => ({ ...p, recordingDefault: v })); toast.success(`Recording default · ${v ? "on" : "off"}`); }} />} />
        <Row label="Require explicit patient consent" hint="Adds a consent prompt before recording begins."
          action={<Toggle checked={t.requireConsent} onChange={(v) => { setT((p) => ({ ...p, requireConsent: v })); toast.success(`Consent prompt · ${v ? "on" : "off"}`); }} />} />
      </Section>
    </>
  );
}
