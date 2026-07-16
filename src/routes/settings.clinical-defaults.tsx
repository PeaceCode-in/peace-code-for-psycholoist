import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Segmented, Toggle, TextArea, PrimaryButton, Chip } from "@/components/settings/primitives";
import { usePersisted } from "@/lib/practice-settings";

export const Route = createFileRoute("/settings/clinical-defaults")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }, { title: "Clinical defaults — Settings" }] }),
  component: ClinicalDefaultsPage,
});

type Format = "SOAP" | "DAP" | "BIRP" | "Free";
const INSTRUMENTS = ["PHQ-9", "GAD-7", "WHO-5", "PSS-10", "AUDIT", "ISI", "PCL-5"] as const;
type Instrument = typeof INSTRUMENTS[number];

interface Defaults {
  noteFormat: Format;
  autoAssign: Instrument[];
  planTemplate: string;
  homeworkPacks: { id: string; name: string; modality: string }[];
}

const DEFAULT: Defaults = {
  noteFormat: "SOAP",
  autoAssign: ["PHQ-9", "GAD-7"],
  planTemplate:
    "Goals\n1. \n2. \n\nMilestones (6-week)\n- \n- \n\nEvidence-based approach\n- ",
  homeworkPacks: [
    { id: "hp1", name: "CBT · Thought records", modality: "CBT" },
    { id: "hp2", name: "Behavioural activation", modality: "BA" },
  ],
};

function ClinicalDefaultsPage() {
  const [d, setD] = usePersisted<Defaults>("clinical-defaults", DEFAULT);
  const toggleInstr = (i: Instrument) => setD((p) => ({ ...p, autoAssign: p.autoAssign.includes(i) ? p.autoAssign.filter((x) => x !== i) : [...p.autoAssign, i] }));

  return (
    <>
      <PageHeader title="Clinical defaults" description="Note format, auto-assigned assessments, treatment plan and homework templates." />

      <Section title="Notes">
        <Row label="Default note format" hint="Applied when you start a new session note."
          action={<Segmented value={d.noteFormat} onChange={(v) => { setD((p) => ({ ...p, noteFormat: v })); toast.success("Note format saved", { description: v }); }}
            options={[{ value: "SOAP", label: "SOAP" }, { value: "DAP", label: "DAP" }, { value: "BIRP", label: "BIRP" }, { value: "Free", label: "Free" }]} />} />
      </Section>

      <Section title="Auto-assign on intake" hint="Sent to the patient the moment intake completes.">
        <div className="p-4 flex flex-wrap gap-2">
          {INSTRUMENTS.map((i) => (
            <Chip key={i} label={i} active={d.autoAssign.includes(i)} onClick={() => { toggleInstr(i); toast.success(d.autoAssign.includes(i) ? `${i} removed` : `${i} added`); }} />
          ))}
        </div>
      </Section>

      <Section title="Treatment plan template" hint="Prefills every new treatment plan.">
        <div className="p-4 space-y-3">
          <TextArea value={d.planTemplate} onChange={(v) => setD((p) => ({ ...p, planTemplate: v }))} rows={8} />
          <div className="flex justify-end"><PrimaryButton onClick={() => toast.success("Template saved")}>Save template</PrimaryButton></div>
        </div>
      </Section>

      <Section title="Homework packs" hint="Reusable exercise sets per modality.">
        <div className="p-4 space-y-2">
          {d.homeworkPacks.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "var(--pc-surface2)", border: "1px solid var(--pc-border)" }}>
              <div>
                <div className="text-[13px]" style={{ color: "var(--pc-ink)" }}>{h.name}</div>
                <div className="text-[11px]" style={{ color: "var(--pc-muted)" }}>{h.modality}</div>
              </div>
              <button className="text-[11px]" style={{ color: "var(--pc-muted)" }}
                onClick={() => { setD((p) => ({ ...p, homeworkPacks: p.homeworkPacks.filter((x) => x.id !== h.id) })); toast.success("Pack removed"); }}>
                Remove
              </button>
            </div>
          ))}
          <PrimaryButton onClick={() => {
            const name = window.prompt("Pack name?"); if (!name) return;
            const modality = window.prompt("Modality? (CBT, ACT, DBT…)") || "General";
            setD((p) => ({ ...p, homeworkPacks: [...p.homeworkPacks, { id: `hp-${Date.now()}`, name, modality }] }));
            toast.success("Pack added");
          }}>Add pack</PrimaryButton>
        </div>
      </Section>
    </>
  );
}
