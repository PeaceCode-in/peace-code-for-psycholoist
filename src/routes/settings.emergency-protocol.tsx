import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, TextArea, PrimaryButton, GhostButton } from "@/components/settings/primitives";
import { usePersisted } from "@/lib/practice-settings";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/settings/emergency-protocol")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }, { title: "Emergency protocol — Settings" }] }),
  component: EmergencyProtocolPage,
});

interface Emergency {
  onCallName: string;
  onCallPhone: string;
  hospitalName: string;
  hospitalPhone: string;
  helplines: { name: string; number: string }[];
  responseScript: string;
}

const DEFAULT: Emergency = {
  onCallName: "Dr. Rohan Iyer",
  onCallPhone: "+91 98200 12345",
  hospitalName: "NIMHANS Bangalore",
  hospitalPhone: "+91 80 26995000",
  helplines: [
    { name: "iCall", number: "9152987821" },
    { name: "Vandrevala", number: "1860-2662-345" },
    { name: "KIRAN", number: "1800-599-0019" },
  ],
  responseScript:
    "1. Ground the patient. Slow breathing.\n2. Ask about means, plan, timeline.\n3. If active plan → Emergency escalation, involve family/hospital.\n4. Draft safety plan before ending contact.",
};

function EmergencyProtocolPage() {
  const [e, setE] = usePersisted<Emergency>("emergency", DEFAULT);
  const addHelpline = () => {
    const name = window.prompt("Helpline name?"); if (!name) return;
    const number = window.prompt("Number?"); if (!number) return;
    setE((p) => ({ ...p, helplines: [...p.helplines, { name, number }] }));
    toast.success("Helpline added");
  };

  return (
    <>
      <PageHeader title="Emergency protocol" description="On-call escalation contact, helplines, safety plan template, SI/HI response script (private)." />

      <Section title="First-line escalation" hint="Contacted the moment you trigger Emergency in-app.">
        <Row label="On-call supervisor">
          <div className="mt-2 grid grid-cols-2 gap-2 max-w-md">
            <TextField value={e.onCallName} onChange={(v) => setE((p) => ({ ...p, onCallName: v }))} placeholder="Name" />
            <TextField value={e.onCallPhone} onChange={(v) => setE((p) => ({ ...p, onCallPhone: v }))} placeholder="Phone" />
          </div>
        </Row>
        <Row label="Local hospital" hint="Nearest inpatient with psychiatric admissions.">
          <div className="mt-2 grid grid-cols-2 gap-2 max-w-md">
            <TextField value={e.hospitalName} onChange={(v) => setE((p) => ({ ...p, hospitalName: v }))} placeholder="Hospital" />
            <TextField value={e.hospitalPhone} onChange={(v) => setE((p) => ({ ...p, hospitalPhone: v }))} placeholder="Phone" />
          </div>
        </Row>
        <div className="px-5 pb-4 flex justify-end">
          <PrimaryButton onClick={() => toast.success("Escalation contacts saved")}>Save contacts</PrimaryButton>
        </div>
      </Section>

      <Section title="Helplines" hint="Read aloud or shared with the patient during a crisis.">
        <div className="p-4 space-y-2">
          {e.helplines.map((h, i) => (
            <div key={`${h.name}-${i}`} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
              <div>
                <div className="text-[13px]" style={{ color: palette.ink }}>{h.name}</div>
                <div className="text-[11px] tabular-nums" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{h.number}</div>
              </div>
              <GhostButton onClick={() => { setE((p) => ({ ...p, helplines: p.helplines.filter((_, idx) => idx !== i) })); toast.success("Removed"); }}>Remove</GhostButton>
            </div>
          ))}
          <PrimaryButton onClick={addHelpline}>Add helpline</PrimaryButton>
        </div>
      </Section>

      <Section title="SI/HI response script" hint="Private notes to yourself — never shared automatically.">
        <div className="p-4 space-y-3">
          <TextArea value={e.responseScript} onChange={(v) => setE((p) => ({ ...p, responseScript: v }))} rows={7} />
          <div className="flex justify-end"><PrimaryButton onClick={() => toast.success("Script saved")}>Save script</PrimaryButton></div>
        </div>
      </Section>
    </>
  );
}
